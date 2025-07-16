import { prisma } from "@/lib/prisma";

export async function createMessage({
  sessionId,
  userId,
  text,
  sender,
}: {
  sessionId: string;
  userId: string;
  text: string;
  sender: string;
}) {
  return prisma.message.create({
    data: { chatSessionId: sessionId, userId, text, sender },
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
  });
}
