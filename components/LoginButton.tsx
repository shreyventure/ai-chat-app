"use client";

import GoogleLogo from "@/assests/GoogleLogo";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginButton({
  className,
  reRouteUrl,
}: {
  className: string;
  reRouteUrl: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={() => {
        setLoading(true);
        signIn("google", { callbackUrl: reRouteUrl });
      }}
      disabled={loading}
      className={`${className}`}
    >
      <GoogleLogo />
      {loading ? <span>Signing in...</span> : <span>Sign in with Google</span>}
    </button>
  );
}
