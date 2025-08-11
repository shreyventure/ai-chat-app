import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ChatClient from "@/components/ChatClient";
import Sidebar from "@/components/Sidebar";

export default async function ChatSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
    return;
  }

  const { sessionId } = await params;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!dbUser) {
    redirect("/");
    return;
  }
  // First verify session exists at all
  const sessionExists = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });
  if (!sessionExists) {
    redirect("/chat");
    return;
  }

  // Then verify user has access
  const participantSessionsResponse = await prisma.chatParticipant.findMany({
    where: { userId: dbUser?.id },
    include: {
      chatSession: true,
    },
    orderBy: {
      chatSession: {
        createdAt: "desc",
      },
    },
  });
  const allSessions = participantSessionsResponse.map((p) => p.chatSession);
  const serializedSessions = allSessions.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));
  const currentSession = serializedSessions.find(
    (sess) => sess.id === sessionId
  );
  if (!currentSession) {
    // Session exists but user doesn't have access - maybe join session?
    redirect("/chat");
  }
  const title = currentSession.title;
  const messages = await prisma.message.findMany({
    where: {
      chatSessionId: sessionId,
    },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div
      className="flex h-screen justify-center items-center overflow-hidden"
      // style={{ border: "5px solid green" }}
    >
      <div className="flex-1 bg-gray-900">
        <Sidebar
          sessions={serializedSessions}
          currentSessionId={sessionId}
          userId={dbUser.id}
          key={sessionId} // Force re-render when session changes
        />
      </div>
      <div className="flex-3 bg-white">
        <ChatClient
          initialMessages={messages}
          sessionId={sessionId}
          title={title ?? ""}
          user={session.user}
        />
      </div>
    </div>
  );
}
