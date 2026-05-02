"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePackPallyAuthOptional } from "@/components/providers/session-provider";
import { hostNeedsStripeConnect, hostStripeIncomplete } from "@/lib/host-needs-stripe-connect";

/** Shown under the partner header while the host has not finished Stripe Express onboarding. */
export function PartnerStripeConnectBanner() {
  const pathname = usePathname();
  const auth = usePackPallyAuthOptional();
  const user = auth?.user;

  if (!hostNeedsStripeConnect(user ?? undefined)) return null;
  if (pathname?.startsWith("/partner/onboarding")) return null;

  const incomplete = hostStripeIncomplete(user ?? undefined);

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 min-w-0">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
          <p className="min-w-0">
            {incomplete ? (
              <>
                <span className="font-semibold">Additional verification required.</span>{" "}
                Stripe needs more information to activate your payouts account.
              </>
            ) : (
              <>
                <span className="font-semibold">Stripe Connect required.</span>{" "}
                Connect Stripe to create trips and listings and to receive payouts.
              </>
            )}
          </p>
        </div>
        <Button
          size="sm"
          asChild
          className="shrink-0 bg-[#635BFF] hover:bg-[#4f46e5] text-white"
        >
          <Link href="/partner/onboarding/stripe">
            {incomplete ? "Complete Setup" : "Connect Stripe"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
