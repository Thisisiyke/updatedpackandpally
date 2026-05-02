"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Banknote,
  FileCheck2,
  ArrowRight,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { PlatformPaymentNotice } from "@/components/shared/platform-payment-notice";
import { isStripeConnected, safePartnerNext } from "@/lib/partner-stripe";

function OnboardingIntro() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safePartnerNext(
    searchParams.get("next"),
    "/mobile/partner"
  );
  const continueHref = `/mobile/partner/onboarding/stripe${
    next !== "/mobile/partner" ? `?next=${encodeURIComponent(next)}` : ""
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
      <div className="flex h-full min-h-[844px] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-gradient-to-br from-primary/5 via-white to-violet-500/5">
      <MobileHeader title="Become a host" />

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-white/70 backdrop-blur px-3 py-1 text-[11px] font-medium">
          <Sparkles className="h-3 w-3 text-primary" />
          Welcome, future host
        </div>

        <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight">
          Set up payouts with Stripe
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Travelers pay Pack &amp; Pally first; we transfer your earnings to your
          connected Stripe account on our schedule. Stripe verifies you and
          handles compliance paperwork.
        </p>

        <div className="mt-4">
          <PlatformPaymentNotice variant="host-inline" />
        </div>

        <div className="mt-6 space-y-3">
          <FeatureRow
            icon={<ShieldCheck className="h-4 w-4 text-primary" />}
            title="Identity verified"
            body="Stripe confirms who you are so travelers can book with confidence."
          />
          <FeatureRow
            icon={<Banknote className="h-4 w-4 text-primary" />}
            title="Payouts from the platform"
            body={`We move your share from Pack & Pally's platform Stripe account to your bank—often within ~48 hours after a trip ends.`}
          />
          <FeatureRow
            icon={<FileCheck2 className="h-4 w-4 text-primary" />}
            title="Zero paperwork"
            body="Stripe handles tax forms, compliance, and documentation."
          />
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            What happens next
          </p>
          <p className="mt-1 text-sm font-bold">
            You&apos;ll continue securely with Stripe
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            We&apos;ll hand you off to Stripe. Once complete, you&apos;ll land
            back here.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" />
            Pack &amp; Pally never sees or stores your identity documents.
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8">
        <Button
          asChild
          size="lg"
          className="w-full h-12 gap-2 bg-[#635BFF] hover:bg-[#4f46e5] text-white"
        >
          <Link href={continueHref}>
            Continue to Stripe
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-white/70 backdrop-blur p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          {body}
        </p>
      </div>
    </div>
  );
}

export default function MobilePartnerOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[844px] items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <OnboardingIntro />
    </Suspense>
  );
}
