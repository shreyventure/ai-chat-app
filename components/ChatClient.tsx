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

      let newMessage = {
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
  }, [sessionId]);

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
    <div className="flex flex-col h-100 max-h-screen min-h-screen m-auto">
      <Alert
        type={alertType}
        message={alertMessage}
        duration={3000}
        isVisible={showAlert}
        setIsVisible={setShowAlert}
        onClose={() => setShowAlert(false)}
      />
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
                        msg.user?.email === user.email
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg max-w-3xl ${
                          msg.user?.email === user.email
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        {msg.sender === "ai" && msg.user?.name && (
                          <p className="text-gray-500">{msg.user.name}</p>
                        )}
                        {msg.sender === "user" &&
                          msg.user?.email !== user.email &&
                          msg.user?.name && (
                            <p className="text-gray-500">{msg.user.name}</p>
                          )}
                        {msg.text}
                      </div>
                    </div>
                  </div>
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
