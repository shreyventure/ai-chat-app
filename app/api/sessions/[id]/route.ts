import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
