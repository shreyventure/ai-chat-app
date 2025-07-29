import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

import { createMessage, getAllSessionMessages } from "@/services/chatService";
import { getGroqChatCompletion } from "@/services/groqService";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log("not authenticated!");
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

    console.log("aiUser", aiUser);
    const body = await req.json();
    const userInput = body.message?.trim();
    const sessionId = body.sessionId;

    if (!userInput || !sessionId || !aiUser) {
      return NextResponse.json(
        { error: "Something not found..." },
        { status: 400 }
      );
    }

    const history = await getAllSessionMessages({ sessionId: sessionId });

    const formattedMessages = history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const chatCompletion = await getGroqChatCompletion(
      formattedMessages,
      userInput
    );

    const aiReply = chatCompletion.choices[0]?.message?.content || "";

    await createMessage({
      text: userInput,
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
