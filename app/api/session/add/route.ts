import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  const chatSessionId = searchParams.get("chatSessionId");
  console.log(userId);
  console.log(chatSessionId);

  if (!userId || !chatSessionId) {
    return NextResponse.json(
      { error: "Missing userId or chatSessionId" },
      { status: 400 }
    );
  }

  try {
    // Ensure both user and session exist
    await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    await prisma.chatSession.findUniqueOrThrow({
      where: { id: chatSessionId },
    });
    const existing = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatSessionId: { userId, chatSessionId }, // assuming compound unique
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Already joined" }, { status: 409 });
    }

    const session = await prisma.chatParticipant.create({
      data: { userId, chatSessionId },
    });

    return NextResponse.json(session);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "User or ChatSession not found" },
        { status: 404 }
      );
    }

    console.error("Internal error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
