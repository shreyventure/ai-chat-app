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
      className="text-8xl font-semibold border-b bg-transparent outline-none text-gray-500 p-3"
    />
  ) : (
    <h1
      onClick={trackEditing}
      className="text-xl font-semibold cursor-pointer m-2 text-gray-500"
      title="Click to edit"
    >
      {title || "(untitled session)"}
    </h1>
  );
}
