"use client";

import Link from "next/link";
import SessionOptionsDropdown from "./SessionOptionsDropdown";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Alert, { AlertType } from "@/components/Alert";
import Spinner from "@/components/Spinner";

const SessionLink = ({
  id,
  createdAt,
  currentSessionId,
  title,
  deleteChatSession,
}: {
  id: string;
  createdAt: string;
  currentSessionId: string;
  title: string | null;
  deleteChatSession: Function;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertType, setAlertType] = useState<AlertType>("success");
  const [alertMessage, setAlertMessage] = useState<string>("");

  const deleteSession = async () => {
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setAlertType("success");
        setAlertMessage("Chat session was deleted!");
        setShowAlert(true);
        console.log("pathname:", pathname);
        deleteChatSession(id);

        if (pathname === `/chat/${id}`) router.push("/chat");
      }
    } catch (error) {
      setAlertType("error");
      setAlertMessage("An error occured.");
      setShowAlert(true);
      console.error(error);
    }
  };

  const handleCopySuccess = () => {
    setAlertType("success");
    setAlertMessage("Session ID copied to clipboard!");
    setShowAlert(true);
  };

  const handleSessionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(`/chat/${id}`);
  };

  return (
    <div
      className={`p-3 rounded-lg flex items-center transition-colors duration-200 ${
        id === currentSessionId
          ? "bg-[#72F5FE] text-black font-medium"
          : "text-gray-300 hover:bg-[#2a2d35] hover:text-white"
      }`}
    >
      <Alert
        type={alertType}
        message={alertMessage}
        duration={3000}
        isVisible={showAlert}
        setIsVisible={setShowAlert}
        onClose={() => setShowAlert(false)}
      />
      <Link
        href={`/chat/${id}`}
        className="flex-1 flex items-center gap-2 min-w-0 cursor-pointer"
        onClick={handleSessionClick}
      >
        <span className="truncate">{title?.trim()}</span>
        {isNavigating && <Spinner />}
      </Link>
      <SessionOptionsDropdown 
        sessionId={id}
        onDelete={deleteSession}
        onCopySuccess={handleCopySuccess}
        className="flex-shrink-0 ml-2"
      />
    </div>
  );
};

export default SessionLink;
