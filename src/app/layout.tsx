import type { Metadata } from "next";
import { plusJakarta, inter } from "@/lib/fonts";
import { AppProviders } from "@/components/providers/app-providers";
import { siteConfig } from "@/lib/constants";
import "./globals.css";

const SITE_TITLE = "Pack & Pally — Curated Group Adventures Worldwide";
const SITE_DESCRIPTION =
  "Connect with fellow travelers and join curated group adventures around the world. Browse trips, view itineraries, and book your next adventure.";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: SITE_TITLE,
    template: "%s · Pack & Pally",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Pack & Pally",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "Pack & Pally",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: siteConfig.url,
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Pack & Pally — Curated Group Adventures Worldwide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-default.jpg"],
  },
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
