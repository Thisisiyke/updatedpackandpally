"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isStripeConnected } from "@/lib/partner-stripe";

export default function MobilePartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isOnboarding = pathname?.startsWith("/mobile/partner/onboarding") ?? false;

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
      const next =
        pathname && pathname !== "/mobile/partner"
          ? `?next=${encodeURIComponent(pathname)}`
          : "";
      router.replace(`/mobile/partner/onboarding${next}`);
    }
  }, [isOnboarding, pathname, router]);

  if (isOnboarding) {
    return <>{children}</>;
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-[844px] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
