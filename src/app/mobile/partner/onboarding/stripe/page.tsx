"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { markStripeConnected, safePartnerNext } from "@/lib/partner-stripe";

function StripeConnectFlow() {
  const router = useRouter();
  const { refresh } = usePackPallyAuth();
  const searchParams = useSearchParams();
  const next = safePartnerNext(searchParams.get("next"));

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [banner, setBanner] = useState("");

  useEffect(() => {
    if (searchParams.get("connected") !== "1") return;
    let cancelled = false;
    fetch("/api/me/profile", { credentials: "include" })
      .then(() =>
        fetch("/api/partner/stripe/connect", { credentials: "include" })
      )
      .then((r) => r.json())
      .then(async (st) => {
        if (cancelled) return;
        if (st.charges_enabled && st.payouts_enabled) {
          // Persist stripeOnboardingComplete = true to Dynamo and refresh cookie
          await fetch("/api/partner/stripe/connect", {
            method: "PATCH",
            credentials: "include",
          }).catch(() => {});
          setBanner("Stripe payouts are active.");
          markStripeConnected();
          await refresh();
          router.replace(next);
          router.refresh();
          return;
        }
        setBanner(
          "Stripe may still need more information or verification. Continue below."
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [searchParams, router, next, refresh]);

  async function startStripe() {
    setErr("");
    setLoading(true);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    try {
      const res = await fetch("/api/partner/stripe/connect", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refreshUrl: `${origin}/mobile/partner/onboarding/stripe`,
          returnUrl: `${origin}/mobile/partner/onboarding/stripe?connected=1`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setErr(
          typeof data.message === "string"
            ? data.message
            : "Could not start Stripe onboarding."
        );
        setLoading(false);
        return;
      }
      window.location.href = data.url as string;
    } catch {
      setErr("Network error.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f9fc] flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl bg-white border border-[#e3e8ee] shadow-sm p-8">
          <p className="text-[#635BFF] text-lg font-bold tracking-tight mb-1">
            stripe
          </p>
          <h1 className="text-xl font-semibold text-[#1a1f36]">
            Connect payouts
          </h1>
          <p className="mt-2 text-sm text-[#697386]">
            Stripe verifies identity and links your bank for deposits from trip
            bookings.
          </p>
          {banner ? (
            <p className="mt-4 text-sm text-[#1a1f36]">{banner}</p>
          ) : null}
          {err ? (
            <p className="mt-4 text-sm text-red-600">{err}</p>
          ) : null}
          <Button
            type="button"
            className="w-full mt-6 h-11 bg-[#635BFF] hover:bg-[#4f46e5] text-white"
            onClick={startStripe}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Continue with Stripe"
            )}
          </Button>
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-[#697386]">
        Powered by Stripe · Pack &amp; Pally partner onboarding
      </footer>
    </div>
  );
}

export default function StripeConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f6f9fc] flex items-center justify-center text-sm text-[#697386]">
          Loading…
        </div>
      }
    >
      <StripeConnectFlow />
    </Suspense>
  );
}
