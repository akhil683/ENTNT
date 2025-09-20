"use client";

import { useEffect, ReactNode } from "react";
import { seedDatabase } from "@/lib/mirage/seed-data";
import { makeServer } from "@/lib/mirage/mirage";

interface ClientProviderProps {
  children: ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined"
    ) {
      makeServer({ environment: "development" });
      console.log("Mirage.js server started");
    }

    async function initializeApp() {
      try {
        await seedDatabase();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    }

    if (typeof window !== "undefined") {
      initializeApp();
    }
  }, []);

  return <>{children}</>;
}
