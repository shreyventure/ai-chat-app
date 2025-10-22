"use client";

import { useRouter, redirect } from "next/navigation";
import { useState } from "react";
import Spinner from "@/components/Spinner";
import Alert, { AlertType } from "@/components/Alert";

export default function NewChatButton({
  className,
  addNewChatSession,
}: {
  className: string;
  addNewChatSession: Function;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertType, setAlertType] = useState<AlertType>("success");
  const [alertMessage, setAlertMessage] = useState<string>("");

  const createNewChat = async () => {
    setLoading(true);
    let data = null;
    try {
      const res = await fetch("/api/session/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `{"title": "New Chat"}`,
      });

      if (!res.ok) {
        let errorText = await res.text().catch(() => "Unknown error");
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        console.error("Session creation failed:", {
          status: res.status,
          error: errorData,
          url: res.url,
        });
        throw new Error(errorData.error || "Unknown error");
      }

      data = await res.json();
      console.log("New session created:", data);
      if (data?.id) {
        console.log("Navigating to:", `/chat/${data.id}`);
        setAlertType("success");
        setAlertMessage("New chat created.");
        setShowAlert(true);
        addNewChatSession(JSON.parse(data.newSession));
        router.push(`/chat/${data.id}`);
      } else {
        setAlertType("error");
        setAlertMessage("An error occured.");
        setShowAlert(true);
        console.error("Error response:", data);
        return;
      }
      setLoading(false);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(
        `An error occured. ${error instanceof Error && JSON.stringify(error)}`
      );
      setShowAlert(true);
      console.error("Failed to create chat:", error);
      setLoading(false);
    }
  };

  return (
    <>
      <Alert
        type={alertType}
        message={alertMessage}
        duration={3000}
        isVisible={showAlert}
        setIsVisible={setShowAlert}
        onClose={() => setShowAlert(false)}
      />
      <button
        onClick={createNewChat}
        className={`border border-gray-600 text-white px-4 py-3 rounded-lg cursor-pointer hover:bg-[#72F5FE] hover:text-black hover:border-[#72F5FE] transition-colors duration-200 font-medium ${className}`}
        disabled={loading}
      >
        {loading ? <Spinner /> : "✨ New Chat"}
      </button>
    </>
  );
}
