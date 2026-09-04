"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useEffect, useState } from "react";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  
  // Minimal auth check for demo
  const [auth, setAuth] = useState(false);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAuth(localStorage.getItem("sentinel_auth") === "true");
    }
  }, []);

  if (isLogin) {
    return <div className="h-screen w-screen">{children}</div>;
  }

  // If not authenticated and not on login page, we'd normally redirect, 
  // but for hackathon demo we'll just show the shell or let Next.js handle redirect in a middleware.
  // We'll let the user see it without hard redirect if they just started it up.

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
