import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Groq from "groq-sdk";
import { ChatCompletionMessageParam } from "openai/resources.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(formattedMessages: any, input: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You're a friendly, helpful assistant who speaks casually like a human.",
      },
      ...formattedMessages,
      {
        role: "user",
        content: input,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}

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

    const body = await req.json();
    const userInput = body.message?.trim();
    const sessionId = body.sessionId;

    if (!userInput || !sessionId) {
      return NextResponse.json(
        { error: "Missing input or sessionId" },
        { status: 400 }
      );
    }

    const history = await prisma.message.findMany({
      where: { chatSessionId: sessionId },
      orderBy: { createdAt: "asc" },
    });

    const formattedMessages = history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const chatCompletion = await getGroqChatCompletion(
      formattedMessages,
      userInput
    );

    const aiReply = chatCompletion.choices[0]?.message?.content || "";

    await prisma.message.create({
      data: {
        text: userInput,
        sender: "user",
        userId: user.id,
        chatSessionId: sessionId,
      },
    });

    await prisma.message.create({
      data: {
        text: aiReply,
        sender: "ai",
        userId: user.id,
        chatSessionId: sessionId,
      },
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
