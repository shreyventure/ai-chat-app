"use client";

import { useState } from "react";

export function SessionTitleEditor({
  initialTitle,
  sessionId,
}: {
  initialTitle: string;
  sessionId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [prevTitle, setPrevTitle] = useState(initialTitle);

  const saveTitle = async () => {
    setEditing(false);
    if (prevTitle.trim() === title.trim()) return;
    await fetch(`/api/sessions/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setPrevTitle(title);
  };

  const trackEditing = () => {
    setEditing(true);
    setPrevTitle(title);
  };

  return editing ? (
    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={saveTitle}
      autoFocus
      className="text-xl font-semibold border-b border-gray-600 bg-transparent outline-none text-white p-3 w-full focus:border-[#72F5FE]"
    />
  ) : (
    <h1
      onClick={trackEditing}
      className="text-xl font-semibold cursor-pointer m-2 text-white hover:text-[#72F5FE] transition-colors duration-200"
      title="Click to edit"
    >
      {title || "(untitled session)"}
    </h1>
  );
}
