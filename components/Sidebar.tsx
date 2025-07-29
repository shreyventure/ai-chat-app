"use client";

import { usePathname } from "next/navigation";
import NewChatButton from "@/components/NewChatButton";
import SessionLink from "@/components/SessionLink";
import NavBar from "@/components/NavBar";

type Session = {
  id: string;
  createdAt: string;
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
    <div className="h-screen p-4 overflow-y-auto bg-[#f5f5f4]">
      <NavBar />
      <NewChatButton className="w-full my-4" />
      <hr />
      <div className="space-y-2 mt-4">
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
