"use client";

import { useEffect, useRef, useState } from "react";
import { SessionTitleEditor } from "./SessionTitleEditor";
import { useVirtualizer } from "@tanstack/react-virtual";

type Message = {
  id: string;
  text: string;
  sender: string;
};

export default function ChatClient({
  initialMessages,
  sessionId,
  title,
}: {
  initialMessages: Message[];
  sessionId: string;
  title: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Adjust based on average message height
    overscan: 10,
  });

  useEffect(() => {
    // rowVirtualizer.scrollToIndex(messages.length - 1, {
    //   align: "start",
    //   behavior: "smooth",
    // });
    // console.log(`scrolling to: ${messages.length - 1}`);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: crypto.randomUUID(),
      text: input,
      sender: "user" as const,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoadingMessage(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input, sessionId }),
    });

    const data = await res.json();

    const aiMessage = {
      id: crypto.randomUUID(),
      text: data.reply,
      sender: "ai" as const,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoadingMessage(false);
  };

  return (
    <div className="flex flex-col h-100 max-h-screen min-h-screen m-auto">
      <div className="border-b">
        <SessionTitleEditor initialTitle={title} sessionId={sessionId} />
      </div>

      {/* Messages area */}
      {messages.length === 0 ? (
        <div className="flex-1 flex justify-center items-center">
          <h1 className="text-gray-500">Nothing here yet.</h1>
        </div>
      ) : (
        <div
          className="flex-1 overflow-auto relative"
          style={{ padding: "0 10rem" }}
          ref={parentRef}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${
                  rowVirtualizer.getVirtualItems()[0]?.start ?? 0
                }px)`,
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                let msg = messages[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                  >
                    <div
                      key={msg.id}
                      className={`my-2 flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg max-w-3xl ${
                          msg.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        {/* <div>
                          <p>{virtualRow.index}</p>
                        </div> */}
                        {msg.text}
                      </div>
                    </div>
                  </div>
                  // ------
                );
              })}
            </div>
          </div>
          {isLoadingMessage ? (
            <p className="text-gray-400">Thinking...</p>
          ) : null}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input bar */}

      <form
        onSubmit={sendMessage}
        className="flex gap-2 p-4 border-t"
        style={{ padding: "1rem 10rem" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 p-2 rounded text-black bg-gray-100 focus:outline-none"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded">
          Send
        </button>
      </form>
    </div>
  );
}
