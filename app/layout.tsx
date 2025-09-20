import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import "./globals.css";
import ReactQueryProvider from "@/components/provider/QueryProvider";
import ClientProvider from "@/components/provider/ClientProvider";

export const metadata: Metadata = {
  title: "TalentFlow - Hiring Platform",
  description: "Professional hiring platform for HR teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ReactQueryProvider>
        <ClientProvider>
          <body
            className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
          >
            <Suspense fallback={null}>{children}</Suspense>
          </body>
        </ClientProvider>
      </ReactQueryProvider>
    </html>
  );
}
