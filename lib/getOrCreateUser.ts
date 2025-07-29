import { prisma } from "./prisma";
import { Session } from "next-auth";

export async function getOrCreateUser(session: Session) {
  if (!session?.user?.email) {
    throw new Error("No email in session.");
  }

  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name ?? "",
      image: session.user.image ?? "",
    },
  });

  return user;
}
