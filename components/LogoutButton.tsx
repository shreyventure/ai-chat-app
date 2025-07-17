"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const LogoutButton = ({
  showProfilePic = false,
  className = "",
  width = 40,
  height = 40,
}: {
  showProfilePic?: boolean;
  className?: string;
  width?: number;
  height?: number;
}) => {
  const [signingOut, setSigningOut] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    return () => {
      setSigningOut(false);
    };
  }, []);

  return (
    <button
      onClick={() => {
        setSigningOut(true);
        signOut({ callbackUrl: "/" });
      }}
      className={`${className}`}
    >
      {showProfilePic && session && session.user?.image ? (
        <Image
          src={session?.user?.image}
          alt="User Avatar"
          width={width}
          height={height}
          className="rounded-full"
        />
      ) : null}
      {signingOut ? "Signing out..." : "Sign out"}
    </button>
  );
};

export default LogoutButton;
