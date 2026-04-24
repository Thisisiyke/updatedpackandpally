"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PartnerSidebar } from "@/components/partner/partner-sidebar";
import { isStripeConnected } from "@/lib/partner-stripe";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isOnboarding = pathname?.startsWith("/partner/onboarding") ?? false;

  const [status, setStatus] = useState<"checking" | "allowed">(
    isOnboarding ? "allowed" : "checking"
  );

  useEffect(() => {
    if (isOnboarding) {
      setStatus("allowed");
      return;
    }
    if (isStripeConnected()) {
      setStatus("allowed");
    } else {
      const next = pathname && pathname !== "/partner"
        ? `?next=${encodeURIComponent(pathname)}`
        : "";
      router.replace(`/partner/onboarding${next}`);
    }
  }, [isOnboarding, pathname, router]);

  if (isOnboarding) {
    return <>{children}</>;
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Loading partner portal…
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="hidden lg:block">
        <PartnerSidebar />
      </div>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
