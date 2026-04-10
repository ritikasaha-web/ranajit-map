// app/layout.tsx
import React from "react";
import "./globals.css";
import Providers from "./providers"; // Import the newly created provider
import { Toaster } from "@/components/ui/sonner";

// Now your layout safely supports Next.js metadata!
export const metadata = {
  title: "Digital Twin - Codez",
  description:
    "Tower vision application for monitoring and managing tower sites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="codez-logo.png" />
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap');
        </style>
      </head>
      <body>
        <main>
          {/* The Providers component wraps your application here */}
          <Providers>{children}</Providers>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
