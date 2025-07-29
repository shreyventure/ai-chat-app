import React, { SyntheticEvent, useState } from "react";

const JoinChatForm = ({ userId }: { userId: string }) => {
  const [chatSessionId, setChatSessionId] = useState("");

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch(
        `/api/session/add?userId=${userId}&chatSessionId=${chatSessionId}`,
        {
          method: "POST",
        }
      );
    } catch (error) {}
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
            className="flex-shrink-0 bg-gray-500 hover:bg-gray-700 border-gray-500 hover:border-gray-700 text-sm border-4 text-white py-1 px-2 rounded"
            type="submit"
          >
            Join
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinChatForm;
