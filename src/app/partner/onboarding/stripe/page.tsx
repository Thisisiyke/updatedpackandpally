"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { markStripeConnected, safePartnerNext } from "@/lib/partner-stripe";
import { hostNeedsStripeConnect, hostStripeIncomplete } from "@/lib/host-needs-stripe-connect";

function StripeConnectFlow() {
  const router = useRouter();
  const { refresh, user } = usePackPallyAuth();
  const searchParams = useSearchParams();
  const next = safePartnerNext(searchParams.get("next"));
  const incomplete = hostStripeIncomplete(user ?? undefined);

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
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

  /** Re-fetches the user record from DynamoDB, refreshes the session cookie,
   *  and updates the AuthContext. Use this after completing onboarding on
   *  mobile so the web app picks up stripeOnboardingComplete = true. */
  async function syncFromDb() {
    setSyncing(true);
    setErr("");
    try {
      await fetch("/api/me/profile", { credentials: "include" });
      await refresh();
      // If Stripe is now fully connected, redirect to the partner dashboard
      if (!hostNeedsStripeConnect(user)) {
        router.replace(next);
        router.refresh();
      }
    } catch {
      setErr("Could not sync. Please try again.");
    } finally {
      setSyncing(false);
    }
  }

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
          refreshUrl: `${origin}/partner/onboarding/stripe`,
          returnUrl: `${origin}/partner/onboarding/stripe?connected=1`,
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
            {incomplete ? "Complete your Stripe setup" : "Connect payouts"}
          </h1>
          <p className="mt-2 text-sm text-[#697386]">
            {incomplete
              ? "Stripe needs a bit more information before your payouts account can be activated. Click below to complete the remaining steps."
              : "Stripe verifies identity and links your bank. Booking revenue is transferred to your connected account; platform fees are applied automatically."}
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
            disabled={loading || syncing}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : incomplete ? (
              "Complete Stripe setup"
            ) : (
              "Continue with Stripe"
            )}
          </Button>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-[#e3e8ee]" />
            <span className="text-xs text-[#697386]">or</span>
            <div className="flex-1 h-px bg-[#e3e8ee]" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4 h-10 text-sm text-[#3c4257] border-[#e3e8ee] hover:bg-[#f6f9fc]"
            onClick={syncFromDb}
            disabled={loading || syncing}
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {syncing ? "Checking…" : "I already completed this — refresh status"}
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
