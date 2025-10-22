import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export default async function ChatSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }
  console.log(session);
  const dbUser = await getOrCreateUser(session);

  console.log(dbUser.id);
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
  console.log("dbUser", dbUser);
  const allSessions = participantSessionsResponse.map((p) => p.chatSession);
  console.log("allSessions", allSessions);
  const serializedSessions = allSessions.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));
  const { sessionId } = await params;

  return (
    <div className="flex h-screen bg-[#26282e] overflow-hidden">
      <div className="w-80 flex-shrink-0">
        <Sidebar
          sessions={serializedSessions}
          currentSessionId={sessionId}
          userId={dbUser.id}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div className="space-y-6">
            <div className="text-6xl">💬</div>
            <h2 className="text-2xl font-semibold text-white">
              Welcome to <span className="text-[#72F5FE]">ConvoSync</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-md">
              Select a session from the left or create a new one to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
