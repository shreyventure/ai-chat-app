import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SessionCreateSchema = z.object({
  title: z.string().min(1).max(100).optional().default("New Chat"),
});

const AI_USER_EMAIL = "ai@abc.com";

export async function POST(req: Request) {
  console.log("Received session creation request");
  try {
    const session = await getServerSession(authOptions);

    const user = session?.user;
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userEmail = user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not available" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let body;
    let title = "New Chat"; // Default title
    try {
      console.log("Request:", req.body);
      body = await req.json();
      console.log("Request body:", body);
      title = SessionCreateSchema.parse(body).title;
    } catch (err) {
      console.error("Failed to parse request body:", err);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body format",
          details: err instanceof Error ? err.message : "",
        },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return await prisma.$transaction(async (tx) => {
      console.log("Starting database transaction");
      // Create or get human user
      const dbUser = await tx.user.upsert({
        where: { email: userEmail },
        update: {},
        create: {
          email: userEmail,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        },
      });

      if (!user) {
        throw new Error("Failed to create user account");
      }

      // Create AI user if doesn't exist
      const aiUser = await tx.user.upsert({
        where: { email: AI_USER_EMAIL },
        update: {},
        create: {
          email: AI_USER_EMAIL,
          name: "AI Assistant",
        },
      });

      // Create new chat session
      const newSession = await tx.chatSession.create({
        data: { title },
      });

      // Add participants
      await Promise.all([
        tx.chatParticipant.create({
          data: {
            userId: dbUser.id,
            chatSessionId: newSession.id,
          },
        }),
        tx.chatParticipant.create({
          data: {
            userId: aiUser.id,
            chatSessionId: newSession.id,
          },
        }),
      ]);

      const responseData = {
        success: true,
        id: newSession.id,
        newSession: JSON.stringify(newSession),
        message: "Chat session created successfully",
      };
      console.log("Session created:", responseData);
      return NextResponse.json(responseData, {
        headers: { "Content-Type": "application/json" },
      });
    });
  } catch (error) {
    console.error("Session creation failed:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    const errorResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create session",
      ...(error instanceof z.ZodError ? { details: error.errors } : {}),
    };
    return NextResponse.json(errorResponse, {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
