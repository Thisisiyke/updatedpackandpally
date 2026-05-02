"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Banknote,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { PlatformPaymentNotice } from "@/components/shared/platform-payment-notice";
import { isStripeConnected, safePartnerNext } from "@/lib/partner-stripe";

function OnboardingIntro() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safePartnerNext(searchParams.get("next"));
  const continueHref = `/partner/onboarding/stripe${
    next !== "/partner" ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isStripeConnected()) {
      router.replace(next);
    } else {
      setChecked(true);
    }
  }, [router, next]);

  if (!checked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Welcome, future host
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Set up payouts with Stripe
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Pack &amp; Pally uses Stripe to verify your identity and connect
              your bank. Travelers pay the{" "}
              <strong className="text-foreground">platform</strong> first; we
              then transfer your earnings to this connected account on our payout
              schedule. Stripe handles compliance documentation.
            </p>
          </div>

          <div className="mt-8">
            <PlatformPaymentNotice variant="host-inline" />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-bold">Identity verified</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Stripe confirms who you are so travelers can book with confidence.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-bold">Payouts from the platform</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We transfer your share from Pack &amp; Pally&apos;s Stripe
                account to your connected bank—often within about 48 hours after
                a trip ends, per policy.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileCheck2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-bold">Zero paperwork</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Stripe takes care of tax forms, compliance, and documentation.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border bg-card p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  What happens next
                </p>
                <h3 className="mt-1 text-xl font-bold">
                  You&apos;ll continue securely with Stripe
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  We&apos;ll hand you off to Stripe to finish onboarding. Once
                  complete, you&apos;ll be redirected back to your partner
                  dashboard.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="h-12 gap-2 bg-[#635BFF] hover:bg-[#4f46e5] text-white px-6 shrink-0"
              >
                <Link href={continueHref}>
                  Continue to Stripe
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              You&apos;ll be redirected to Stripe&apos;s secure onboarding.
              Pack &amp; Pally never sees or stores your identity documents.
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function PartnerOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <OnboardingIntro />
    </Suspense>
  );
}
