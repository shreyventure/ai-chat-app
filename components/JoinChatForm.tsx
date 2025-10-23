import React, { SyntheticEvent, useState } from "react";

import Spinner from "@/components/Spinner";

const JoinChatForm = ({ userId }: { userId: string }) => {
  const [chatSessionId, setChatSessionId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!chatSessionId.trim()) return;
    try {
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
      <form className="w-full mb-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <input
            className="flex-1 bg-[#26282e] border border-gray-600 text-white py-2 px-3 rounded-lg focus:outline-none focus:border-[#72F5FE] focus:ring-1 focus:ring-[#72F5FE] placeholder-gray-400"
            type="text"
            placeholder="Enter session ID"
            value={chatSessionId}
            onChange={(e) => {
              setChatSessionId(e.target.value);
            }}
          />
          <button
            className="bg-[#72F5FE] hover:bg-[#5de3ec] text-black font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
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
