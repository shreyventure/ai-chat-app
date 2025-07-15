"use client";

import { usePathname } from "next/navigation";
import NewChatButton from "./NewChatButton";
import SessionLink from "./SessionLink";

type Session = {
  id: string;
  createdAt: string;
  userId: string;
  title: string | null;
};

export default function Sidebar({
  sessions,
  currentSessionId,
}: {
  sessions: Session[];
  currentSessionId: string;
}) {
  const pathname = usePathname();

  return (
    <div className="h-screen p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">Your Sessions</div>
        <NewChatButton />
      </div>
      <div className="space-y-2">
        {sessions.map((s) => (
          <SessionLink
            key={s.id}
            id={s.id}
            createdAt={s.createdAt}
            currentSessionId={currentSessionId}
            title={s.title}
          />
        ))}
      </div>
    </div>
  );
}
