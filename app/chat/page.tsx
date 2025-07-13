import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";

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

  return (
    <div
      className="flex h-screen justify-center items-center overflow-hidden"
      // style={{ border: "5px solid green" }}
    >
      <div className="flex-1 bg-gray-900">
        <Sidebar sessions={serializedSessions} currentSessionId={sessionId} />
      </div>
      <div className="flex-3 bg-white">
        {/* <ChatClient
          initialMessages={messages}
          sessionId={sessionId}
          title={title ?? ""}
        /> */}
        <div className="flex h-100 max-h-screen min-h-screen m-auto justify-center items-center text-center text-gray-500">
          <div>
            <p>Select a session from the left</p>
            <p>or create a new one to get started 💬</p>
          </div>
        </div>
      </div>
    </div>
  );
}
