"use client";

import Link from "next/link";
import MoreOptionButton from "./MoreOptionButton";
import { redirect } from "next/navigation";

const SessionLink = ({
  id,
  createdAt,
  currentSessionId,
  title,
}: {
  id: string;
  createdAt: string;
  currentSessionId: string;
  title: string | null;
}) => {
  const formattedDate = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const deleteSession = async () => {
    try {
      await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
      });
      redirect("/chat");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={`p-2 rounded cursor-pointer flex items-center ${
        id === currentSessionId
          ? "bg-purple-500 text-white"
          : "hover:bg-gray-400"
      }`}
    >
      <Link href={`/chat/${id}`} className="flex-6">
        {title?.trim() ?? `Chat on ${formattedDate(createdAt)}`}
      </Link>
      <div
        className="flex-1 flex items-center justify-end"
        onClick={deleteSession}
      >
        <MoreOptionButton className="" />
      </div>
    </div>
  );
};

export default SessionLink;
