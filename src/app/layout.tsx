import type { Metadata } from "next";
import { plusJakarta, inter } from "@/lib/fonts";
import { AppProviders } from "@/components/providers/app-providers";
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
