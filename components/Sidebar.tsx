"use client";

import { usePathname } from "next/navigation";
import NewChatButton from "@/components/NewChatButton";
import SessionLink from "@/components/SessionLink";
import NavBar from "@/components/NavBar";
import JoinChatForm from "./JoinChatForm";
import { useState } from "react";

type Session = {
  id: string;
  createdAt: string;
  title: string | null;
};

export default function Sidebar({
  sessions,
  currentSessionId,
  userId,
}: {
  sessions: Session[];
  currentSessionId: string;
  userId: string;
}) {
  const pathname = usePathname();
  const [chatSessions, setChatSessions] = useState(sessions);

  const addNewChatSession = (chatSession: Session) => {
    setChatSessions([chatSession, ...chatSessions]);
  };

  const deleteChatSession = (chatSessionId: string) => {
    setChatSessions(chatSessions.filter((cs) => cs.id !== chatSessionId));
  };

  return (
    <div className="h-full flex flex-col bg-[#1f2127] border-r border-gray-700">
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <NavBar />
      </div>
      <div className="flex-shrink-0 p-4">
        <JoinChatForm userId={userId} />
        <NewChatButton
          className="w-full"
          addNewChatSession={addNewChatSession}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {chatSessions.map((s) => (
            <SessionLink
              key={s.id}
              id={s.id}
              createdAt={s.createdAt}
              currentSessionId={currentSessionId}
              title={s.title}
              deleteChatSession={deleteChatSession}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
