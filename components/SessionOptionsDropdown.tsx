"use client";

import { useState, useRef, useEffect } from "react";
import MoreOptionButton from "./MoreOptionButton";

interface SessionOptionsDropdownProps {
  sessionId: string;
  onDelete: () => void;
  onCopySuccess?: () => void;
  className?: string;
}

const SessionOptionsDropdown = ({ sessionId, onDelete, onCopySuccess, className = "" }: SessionOptionsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    onDelete();
  };

  const handleCopySessionId = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    
    try {
      await navigator.clipboard.writeText(sessionId);
      onCopySuccess?.();
    } catch (error) {
      console.error('Failed to copy session ID:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = sessionId;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        onCopySuccess?.();
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="p-1 rounded hover:bg-gray-600 transition-colors duration-200"
        aria-label="Session options"
      >
        <MoreOptionButton className="text-current" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-[100] bg-[#1f2127] border border-gray-600 rounded-lg shadow-xl min-w-[200px] max-w-[500px]">
          <div className="py-1">
            <button
              onClick={handleCopySessionId}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#72F5FE]/10 hover:text-[#72F5FE] transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                />
              </svg>
              Copy Session ID
            </button>
            <div className="border-t border-gray-600 my-1"></div>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-7.82 0c-1.18.037-2.09 1.022-2.09 2.201v.916m15.5 0a48.108 48.108 0 00-3.478-.397m-7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-7.82 0c-1.18.037-2.09 1.022-2.09 2.201v.916"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionOptionsDropdown;