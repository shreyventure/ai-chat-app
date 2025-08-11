import React, { SyntheticEvent, useState } from "react";

import Spinner from "@/components/Spinner";

const JoinChatForm = ({ userId }: { userId: string }) => {
  const [chatSessionId, setChatSessionId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!chatSessionId.trim()) return;
    try {
      console.log(userId, chatSessionId);
      setLoading(true);
      const resp = await fetch(`/api/session/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, chatSessionId }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        console.error(errorData);
        alert(errorData.error || "Failed to join session");
      } else {
        setChatSessionId("");
      }
      setLoading(false);
    } catch (error) {
      console.error("Join session failed:", error);
      alert("Network error while joining session");
      setLoading(false);
    }
  };
  return (
    <div>
      <form className="w-full max-w-sm" onSubmit={handleSubmit}>
        <div className="flex items-center border-b border-gray-400 py-2">
          <input
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            type="text"
            placeholder="Enter session ID"
            aria-label="Full name"
            value={chatSessionId}
            onChange={(e) => {
              setChatSessionId(e.target.value);
            }}
          />
          <button
            className="flex-shrink-0 bg-gray-500 hover:bg-gray-700 hover:cursor-pointer border-gray-500 hover:border-gray-700 text-sm border-4 text-white text-center py-1 px-2 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? <Spinner /> : "Join"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinChatForm;
