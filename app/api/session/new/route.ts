import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!aiUser) {
    return NextResponse.json({ error: "AI not found" }, { status: 404 });
  }

  const newSession = await prisma.chatSession.create({
    data: { title: "New Chat" },
  });

  await prisma.chatParticipant.create({
    data: {
      userId: user.id,
      chatSessionId: newSession.id,
    },
  });

  await prisma.chatParticipant.create({
    data: {
      userId: aiUser.id,
      chatSessionId: newSession.id,
    },
  });

  return NextResponse.json({ id: newSession.id });
}
