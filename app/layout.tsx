"use client";
import React, { useState } from "react";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 min cache
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return (
    <html lang="en">
      <head>
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap');
        </style>
      </head>
      <body>
        <main>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
