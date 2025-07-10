"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body data-new-gr-c-s-check-loaded="14.1243.0" data-gr-ext-installed="">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
