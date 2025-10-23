"use client";

import { useEffect, useRef, useState } from "react";
import { SessionTitleEditor } from "./SessionTitleEditor";
import { useVirtualizer } from "@tanstack/react-virtual";
import { io } from "socket.io-client";
import Alert, { AlertType } from "@/components/Alert";

let socket: any;

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
    // Initialize socket connection with better error handling
    socket = io(undefined, { 
      path: "/api/socketio",
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      timeout: 20000,
      forceNew: true
    });
    
    socket.on('connect', () => {
      socket.emit("join-session", sessionId);
    });

    socket.on('disconnect', (reason: any) => {
      // Socket disconnected
    });

    socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });

    socket.on('reconnect', (attemptNumber: any) => {
      socket.emit("join-session", sessionId);
    });

    socket.on("chat-message", (data: any) => {
      const newMessage = {
        id: data.id || crypto.randomUUID(),
        text: data.text,
        sender: data.sender,
        user: data.user || {
          email: "ai@abc.com",
          image:
            "https://lh3.googleusercontent.com/a/ACg8ocJ6eljr_dL_-0H1zKrpFlamsuKKa3uS7SYQtsjjC7CTDn12fQ=s96-c",
          name: "AI Assistant",
        },
      };

      setMessages((prev) => {
        // Check for duplicates by ID first
        if (data.id && prev.some((m) => m.id === data.id)) {
          return prev;
        }
        
        // For AI messages, check for content duplicates (since AI responses might not have consistent IDs)
        if (data.sender === "ai") {
          const recentAIMessages = prev.filter(m => m.sender === "ai").slice(-3); // Check last 3 AI messages
          if (recentAIMessages.some(m => m.text === data.text)) {
            return prev;
          }
        }
        
        // For user messages, only add if it's from another user
        if (data.sender === "user" && data.user?.email === user.email) {
          return prev; // Skip own messages as they're added optimistically
        }
        
        return [...prev, newMessage];
      });
    });

    return () => {
      socket.off("chat-message");
      socket.disconnect();
    };
  }, [sessionId, user.email]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageText = input.trim();
    const userMessage = {
      id: crypto.randomUUID(),
      text: messageText,
      sender: "user" as const,
      user: user || {},
    };

    // Optimistically add user message to UI
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoadingMessage(true);

    // Emit user message via socket for other users (if connected)
    if (socket && socket.connected) {
      socket.emit("chat-message", {
        sessionId,
        message: userMessage,
      });
    }

    let res;
    try {
      // Validate sessionId is a valid UUID v4

      res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
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
      setIsLoadingMessage(false);
      
      // Add AI response directly to UI (fallback for when socket fails)
      const aiMessage = {
        id: crypto.randomUUID(),
        text: data.reply,
        sender: "ai" as const,
        user: {
          email: "ai@abc.com",
          image:
            "https://lh3.googleusercontent.com/a/ACg8ocJ6eljr_dL_-0H1zKrpFlamsuKKa3uS7SYQtsjjC7CTDn12fQ=s96-c",
          name: "AI Assistant",
        },
      };

      // Add AI message to local state immediately
      setMessages((prev) => {
        // Check if this AI response already exists to prevent duplicates
        if (prev.some(m => m.text === data.reply && m.sender === "ai")) {
          return prev;
        }
        return [...prev, aiMessage];
      });
      
      // Emit AI response via socket for other users in the session (if socket is connected)
      if (socket && socket.connected) {
        socket.emit("chat-message", {
          sessionId,
          message: aiMessage,
        });
      }
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
