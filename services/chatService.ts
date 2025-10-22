import { prisma } from "@/lib/prisma";

export async function createMessage({
  sessionId,
  userId,
  text,
  sender,
  user,
}: {
  sessionId: string;
  userId: string;
  text: string;
  sender: string;
  user?: { name: string };
}) {
  // Store raw message without name prefix
  return prisma.message.create({
    data: {
      chatSessionId: sessionId,
      userId,
      text, // Store raw message
      sender,
    },
  });
}

export async function getAllSessionMessages({
  sessionId,
}: {
  sessionId: string;
}) {
  return prisma.message.findMany({
    where: { chatSessionId: sessionId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}
