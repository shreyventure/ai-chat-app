import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(input: string) {
  return groq.chat.completions.create({
    messages: [
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

    const chatCompletion = await getGroqChatCompletion(userInput);

    const aiReply = chatCompletion.choices[0]?.message?.content || "";

    await Promise.all([
      prisma.message.create({
        data: {
          text: userInput,
          sender: "user",
          userId: user.id,
          chatSessionId: sessionId,
        },
      }),
      prisma.message.create({
        data: {
          text: aiReply,
          sender: "ai",
          userId: user.id,
          chatSessionId: sessionId,
        },
      }),
    ]);

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
