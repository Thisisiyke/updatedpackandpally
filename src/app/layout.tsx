import type { Metadata } from "next";
import { plusJakarta, inter } from "@/lib/fonts";
import { RouteShell } from "@/components/layout/route-shell";
import { AuthProvider } from "@/components/providers/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pack & Pally — Curated Group Adventures Worldwide",
  description:
    "Connect with fellow travelers and join curated group adventures around the world. Browse trips, view itineraries, and book your next adventure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <TooltipProvider>
            <RouteShell>{children}</RouteShell>
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
