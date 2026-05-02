"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StripeRequiredForCreate({
  kind,
}: {
  kind: "trip" | "listing";
}) {
  const noun =
    kind === "trip"
      ? "group trips"
      : "property listings";
  const backHref =
    kind === "trip" ? "/partner/trips" : "/partner/listings";

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#635BFF]/10">
          <CreditCard className="h-7 w-7 text-[#635BFF]" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          Connect Stripe first
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Finish Stripe Express onboarding before you create {noun}. This verifies
          your identity and links your bank so you can receive payouts.
        </p>
        <Button
          asChild
          className="mt-6 w-full h-11 bg-[#635BFF] hover:bg-[#4f46e5] text-white"
        >
          <Link href="/partner/onboarding/stripe">Continue to Stripe Connect</Link>
        </Button>
        <Button variant="ghost" asChild className="mt-3 w-full">
          <Link href={backHref}>Back</Link>
        </Button>
      </div>
    </div>
  );
}
