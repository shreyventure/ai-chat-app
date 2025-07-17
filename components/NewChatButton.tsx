"use client";

import { useRouter } from "next/navigation";

export default function NewChatButton({ className }: { className: string }) {
  const router = useRouter();

  const createNewChat = async () => {
    const res = await fetch("/api/session/new", { method: "POST" });
    const data = await res.json();
    console.log(data);
    router.push(`/chat/${data.id}`);
  };

  return (
    <button
      onClick={createNewChat}
      className={`border text-gray-500 px-4 py-2 rounded cursor-pointer hover:bg-gray-50 ${className}`}
    >
      New Chat
    </button>
  );
}
