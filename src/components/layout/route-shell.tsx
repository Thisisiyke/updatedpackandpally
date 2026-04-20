"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Chatbot } from "@/components/ai/chatbot";

export function RouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = pathname?.startsWith("/mobile");

  if (isMobile) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </>
  );
}
