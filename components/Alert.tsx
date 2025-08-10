"use client";

import { useEffect, useState } from "react";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  message: string;
  isVisible: boolean;
  setIsVisible: Function;
  duration?: number;
  onClose?: () => void;
}

const Alert = ({
  type,
  message,
  isVisible,
  setIsVisible,
  duration = 5000,
  onClose,
}: AlertProps) => {
  // const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const alertStyles = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-500 rounded-lg border px-4 py-3 max-w-xs md:max-w-sm ${alertStyles[type]}`}
      role="alert"
    >
      <div className="flex items-center">
        <div className="flex-1">
          <strong className="font-bold capitalize">{type}!</strong>
          <span className="block sm:inline ml-1">{message}</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Alert;
