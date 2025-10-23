import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const JoinSessionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  chatSessionId: z.string().min(1, "Session ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();

    const validation = JoinSessionSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid parameters",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { userId, chatSessionId } = validation.data;

    // Ensure both user and session exist
    await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    await prisma.chatSession.findUniqueOrThrow({
      where: { id: chatSessionId },
    });

    const existing = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatSessionId: { userId, chatSessionId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already joined" }, { status: 409 });
    }

    const session = await prisma.chatParticipant.create({
      data: { userId, chatSessionId },
    });

    return NextResponse.json(session);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "User or ChatSession not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
