"use client";

import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";

export default function AuthComponent() {
  const { status } = useSession();

  if (status === "authenticated")
    return (
      <LogoutButton
        className="mt-4 bg-red-400 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-lg w-fit mx-auto md:mx-0 flex items-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
        showProfilePic={true}
        width={25}
        height={25}
      />
    );

  if (status === "unauthenticated")
    return (
      <LoginButton
        className="mt-4 bg-white hover:bg-gray-200 text-black font-semibold py-3 px-6 rounded-lg w-fit mx-auto md:mx-0 flex items-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
        reRouteUrl="/chat"
      />
    );

  return (
    <button
      disabled={true}
      className="mt-4 bg-gray-500 text-gray-200 font-semibold py-3 px-6 rounded-lg w-fit mx-auto md:mx-0 flex items-center gap-3 shadow-md transition-all"
    >
      Loading ...
    </button>
  );
}
