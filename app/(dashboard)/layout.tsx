"use client"
import { Sidebar } from "@/components/layout/sidebar";
import { redirect } from "next/navigation";
import { useEffect } from "react";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const username = localStorage.getItem("username")
    const password = localStorage.getItem("password")
    if (username !== process.env.NEXT_PUBLIC_USERNAME || password !== process.env.NEXT_PUBLIC_PASSWORD) {
      redirect("/")
    }
  }, [])
  return (

    <main className="flex h-screen bg-background">
      <Sidebar />
      {children}
    </main>
  );
}
