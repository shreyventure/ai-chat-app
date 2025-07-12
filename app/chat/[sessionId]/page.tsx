import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ChatClient from "../../components/ChatClient";
import Sidebar from "@/app/components/Sidebar";
import { SessionTitleEditor } from "@/app/components/SessionTitleEditor";

export default async function ChatSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  const allSessions = await prisma.chatSession.findMany({
    where: { userId: dbUser?.id },
    orderBy: { createdAt: "desc" },
  });
  const serializedSessions = allSessions.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));
  const { sessionId } = await params;
  const title = serializedSessions.filter((sess) => sess.id === sessionId)[0]
    .title;
  const messages = await prisma.message.findMany({
    where: {
      userId: dbUser?.id,
      chatSessionId: sessionId,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div
      className="flex h-screen justify-center items-center overflow-hidden"
      // style={{ border: "5px solid green" }}
    >
      <div className="flex-1 bg-gray-900">
        <Sidebar sessions={serializedSessions} currentSessionId={sessionId} />
      </div>
      <div className="flex-3 bg-white">
        <ChatClient
          initialMessages={messages}
          sessionId={sessionId}
          title={title ?? ""}
        />
      </div>
    </div>
  );
}
