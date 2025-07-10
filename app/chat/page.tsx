"use client";

import { useState, useEffect, useRef } from "react";

export default function ChatClient() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    const aiMessage = { sender: "ai", text: data.reply };
    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="p-4 max-w-xl mx-auto min-h-screen flex flex-col justify-start">
      <h1 className="text-2xl font-bold mb-4">Chat with AI</h1>
      <div>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef}>
          {isLoading && (
            <div className="text-center text-sm text-gray-500">Thinking...</div>
          )}
        </div>
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 my-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded">
          Send
        </button>
      </form>
    </main>
  );
}
