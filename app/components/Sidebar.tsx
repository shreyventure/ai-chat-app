"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const formattedDate = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  return (
    <div className="h-screen p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Your Sessions</h2>
      <div className="space-y-2">
        {sessions.map((s) => (
          <Link key={s.id} href={`/chat/${s.id}`}>
            <div
              className={`p-2 rounded cursor-pointer ${
                s.id === currentSessionId
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-400"
              }`}
            >
              {s.title?.trim() ?? `Chat on ${formattedDate(s.createdAt)}`}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
