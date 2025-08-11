import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { id } = await params;
  const title = body.title?.slice(0, 100); // Sanitize input
  const session = await prisma.chatSession.update({
    where: { id },
    data: { title },
  });

  return NextResponse.json(session);
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const session = await prisma.chatSession.findUnique({
    where: { id },
  });

  return NextResponse.json(session);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    console.log(id);
    const session = await prisma.chatSession.delete({
      where: { id },
    });

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
