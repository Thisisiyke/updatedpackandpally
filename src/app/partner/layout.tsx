"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PartnerSidebar } from "@/components/partner/partner-sidebar";
import { PartnerStripeConnectBanner } from "@/components/partner/partner-stripe-connect-banner";
import { usePackPallyAuthOptional } from "@/components/providers/session-provider";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOnboarding = pathname?.startsWith("/partner/onboarding") ?? false;
  const auth = usePackPallyAuthOptional();
  const syncedRef = useRef(false);

  const [status, setStatus] = useState<"checking" | "allowed">(
    isOnboarding ? "allowed" : "checking"
  );

  useEffect(() => {
    if (isOnboarding) {
      setStatus("allowed");
      return;
    }
    setStatus("allowed");
  }, [isOnboarding]);

  /**
   * On first load of the partner area, re-fetch the user record from DynamoDB
   * and refresh the session cookie + AuthContext. This ensures stripeOnboardingComplete
   * and other DB fields are always current — even if the user logged in before
   * finishing Stripe onboarding on mobile or another device.
   */
  useEffect(() => {
    if (isOnboarding) return;
    if (syncedRef.current) return;
    if (!auth?.user?.id) return;
    syncedRef.current = true;
    fetch("/api/me/profile", { credentials: "include" })
      .then(() => auth.refresh())
      .catch(() => {});
  }, [isOnboarding, auth?.user?.id]);

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
      <main className="flex-1 min-w-0 flex flex-col">
        <PartnerStripeConnectBanner />
        <div className="flex-1 min-w-0">{children}</div>
      </main>
    </div>
  );
}
