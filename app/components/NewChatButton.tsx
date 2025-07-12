"use client";

import { useRouter } from "next/navigation";

export default function NewChatButton() {
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
      className="bg-green-500 text-white px-4 py-2 rounded"
    >
      + New Chat
    </button>
  );
}
