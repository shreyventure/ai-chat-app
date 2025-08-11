import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";

import { createMessage, getAllSessionMessages } from "@/services/chatService";
import { getGroqChatCompletion } from "@/services/groqService";

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000, "Message must be 1-1000 characters"),
  sessionId: z.string().min(1, "Session ID is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Save user if not exists
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
    });

    const aiUser = await prisma.user.findUnique({
      where: { email: "ai@abc.com" },
    });

    if (!aiUser) {
      return NextResponse.json(
        { error: "AI user configuration missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const validation = ChatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { message: userInput, sessionId } = validation.data;

    const history = await getAllSessionMessages({ sessionId: sessionId });

    const formattedMessages = history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    // Prefix name only when sending to AI
    const prefixedInput = `${user.name}: ${userInput}`;
    const chatCompletion = await getGroqChatCompletion(
      formattedMessages,
      prefixedInput
    );

    const aiReply = chatCompletion.choices[0]?.message?.content || "";

    await createMessage({
      text: userInput, // Store raw message
      sender: "user",
      userId: user.id,
      sessionId: sessionId,
    });

    await createMessage({
      text: aiReply,
      sender: "ai",
      userId: aiUser.id,
      sessionId: sessionId,
    });

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
