"use client";

import { useEffect, useRef, useState } from "react";
import { SessionTitleEditor } from "./SessionTitleEditor";
import { useVirtualizer } from "@tanstack/react-virtual";
import { io } from "socket.io-client";
import Alert, { AlertType } from "@/components/Alert";

const socket = io(undefined, { path: "/api/socketio" });

interface User {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  user: User | null | undefined;
}

export default function ChatClient({
  initialMessages,
  sessionId,
  title,
  user,
}: {
  initialMessages: Message[];
  sessionId: string;
  title: string;
  user: User;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState<string>("");
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(false);

  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertType, setAlertType] = useState<AlertType>("success");
  const [alertMessage, setAlertMessage] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.emit("join-session", sessionId);

    socket.on("chat-message", (data) => {
      // check for duplicates
      if (data.id && messages.some((m) => m.id === data.id)) return;

      const newMessage = {
        id: data.id || crypto.randomUUID(),
        text: data.text,
        sender: data.sender,
        user: data.user || {
          email: "ai@abc.com",
          image:
            "https://lh3.googleusercontent.com/a/ACg8ocJ6eljr_dL_-0H1zKrpFlamsuKKa3uS7SYQtsjjC7CTDn12fQ=s96-c",
          name: "Ai",
        },
      };

      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("chat-message");
    };
  }, [sessionId, messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: crypto.randomUUID(),
      text: input,
      sender: "user" as const,
      user: user || {},
    };

    const messageWithId = { ...userMessage, id: crypto.randomUUID() };
    setInput("");
    setIsLoadingMessage(true);

    socket.emit("chat-message", {
      sessionId,
      message: { ...messageWithId, text: input, sender: "user", user },
    });

    let res;
    try {
      // Validate sessionId is a valid UUID v4

      res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          sessionId: sessionId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error Details:", {
          status: res.status,
          error: errorData.error,
          details: errorData.details || "No additional details",
        });
        setIsLoadingMessage(false);
        return;
      }
      const data = await res.json();

      const aiMessage = {
        id: crypto.randomUUID(),
        text: data.reply,
        sender: "ai" as const,
        user: {
          email: "ai@abc.com",
          image:
            "https://lh3.googleusercontent.com/a/ACg8ocJ6eljr_dL_-0H1zKrpFlamsuKKa3uS7SYQtsjjC7CTDn12fQ=s96-c",
          name: "Ai",
        },
      };

      const aiMessageWithId = { ...aiMessage, id: crypto.randomUUID() };
      setIsLoadingMessage(false);

      socket.emit("chat-message", {
        sessionId,
        message: { ...aiMessageWithId, text: data.reply, sender: "ai" },
      });
    } catch (error) {
      console.error("Request failed:", error);
      setAlertType("error");
      setAlertMessage(
        error instanceof Error ? error.message : "An error occured."
      );
      setShowAlert(true);
      setIsLoadingMessage(false);
      return;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#26282e] text-white">
      <Alert
        type={alertType}
        message={alertMessage}
        duration={3000}
        isVisible={showAlert}
        setIsVisible={setShowAlert}
        onClose={() => setShowAlert(false)}
      />
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-700 bg-[#1f2127]">
        <SessionTitleEditor initialTitle={title} sessionId={sessionId} />
      </div>

      {/* Messages area */}
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-6">
            <div className="text-6xl">🤖</div>
            <h2 className="text-xl text-gray-300">Ready to chat!</h2>
            <p className="text-gray-400">Start the conversation below</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div
            className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-4"
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
                  const msg = messages[virtualRow.index];
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                    >
                      <div
                        key={msg.id}
                        className={`mb-4 flex ${
                          msg.user?.email === user.email
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`px-4 py-3 rounded-2xl max-w-2xl shadow-md ${
                            msg.user?.email === user.email
                              ? "bg-[#72F5FE] text-black font-medium shadow-[#72F5FE]/20"
                              : "bg-[#1f2127] text-white shadow-black/20"
                          }`}
                        >
                          {msg.sender === "ai" && msg.user?.name && (
                            <p className="text-[#72F5FE] text-sm font-medium mb-1">
                              {msg.user.name}
                            </p>
                          )}
                          {msg.sender === "user" &&
                            msg.user?.email !== user.email &&
                            msg.user?.name && (
                              <p className="text-gray-400 text-sm font-medium mb-1">
                                {msg.user.name}
                              </p>
                            )}
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Loading indicator - positioned outside the scrollable area */}
          {isLoadingMessage && (
            <div className="flex-shrink-0 px-4 md:px-8 lg:px-16 pb-2">
              <div className="flex justify-start">
                <div className="bg-[#1f2127] px-4 py-3 rounded-2xl shadow-md shadow-black/20">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#72F5FE] rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-[#72F5FE] rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#72F5FE] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-gray-400 text-sm">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-gray-700 bg-[#1f2127] p-4 md:px-8 lg:px-16">
        <form onSubmit={sendMessage} className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 p-3 rounded-xl bg-[#26282e] text-white border border-gray-600 focus:outline-none focus:border-[#72F5FE] focus:ring-1 focus:ring-[#72F5FE] placeholder-gray-400 shadow-sm"
          />
          <button
            type="submit"
            className="bg-[#72F5FE] hover:bg-[#5de3ec] text-black font-medium px-6 py-3 rounded-xl transition-colors duration-200 disabled:opacity-50 shadow-sm"
            disabled={!input.trim() || isLoadingMessage}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
