"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CreditCard,
  Download,
  FileText,
  Banknote,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  PartnerPayoutsApiOk,
  PartnerStripePayoutRow,
} from "@/lib/partner-payouts-types";
import { StripeAccountCard } from "@/components/partner/stripe-account-card";
import { cn } from "@/lib/utils";

function formatMajor(amountCents: number, currency: string) {
  const cur = (currency || "usd").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${cur}`;
  }
}

function periodLabel(p: PartnerStripePayoutRow): string {
  const iso =
    p.arrivalDate ||
    new Date((p.created || 0) * 1000).toISOString().slice(0, 10);
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function payoutUiStatus(stripeStatus: string) {
  switch (stripeStatus) {
    case "paid":
      return "paid";
    case "pending":
      return "pending";
    case "in_transit":
      return "processing";
    case "failed":
      return "failed";
    case "canceled":
      return "cancelled";
    default:
      return "other";
  }
}

function getStatusConfig(ui: ReturnType<typeof payoutUiStatus>) {
  switch (ui) {
    case "paid":
      return {
        label: "Paid",
        class: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "pending":
      return {
        label: "Pending",
        class: "bg-amber-100 text-amber-800 border-amber-200",
      };
    case "processing":
      return {
        label: "In transit",
        class: "bg-blue-100 text-blue-800 border-blue-200",
      };
    case "failed":
      return {
        label: "Failed",
        class: "bg-red-100 text-red-800 border-red-200",
      };
    case "cancelled":
      return {
        label: "Canceled",
        class: "bg-gray-100 text-gray-700 border-gray-200",
      };
    default:
      return { label: "Other", class: "bg-gray-100 text-gray-700 border-gray-200" };
  }
}

function formatPayoutMethod(method: string) {
  const m = (method || "").toLowerCase();
  if (m === "instant") return "Instant";
  if (m === "standard") return "Standard (bank)";
  return method || "Bank";
}

function nextHeroBadge(status: string | undefined) {
  if (!status) return "Stripe";
  if (status === "pending") return "Pending";
  if (status === "in_transit") return "In transit";
  return status.replace(/_/g, " ");
}

function downloadPayoutsCsv(rows: PartnerStripePayoutRow[]) {
  const headers = [
    "id",
    "period_month",
    "arrival_date",
    "created_unix",
    "amount_cents",
    "currency",
    "status",
    "method",
    "description",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((p) =>
      [
        p.id,
        periodLabel(p).replace(/,/g, " "),
        p.arrivalDate || "",
        String(p.created),
        String(p.amountCents),
        p.currency,
        p.status,
        p.method,
        (p.description || "").replace(/,/g, " "),
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stripe-payouts-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PartnerPayoutsPage() {
  const [payload, setPayload] = useState<PartnerPayoutsApiOk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeOpening, setStripeOpening] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/partner/payouts?limit=60", {
        credentials: "include",
      });
      let data: PartnerPayoutsApiOk & { message?: string };
      try {
        data = (await res.json()) as PartnerPayoutsApiOk & { message?: string };
      } catch {
        throw new Error(
          res.ok ? "Invalid response from server" : `Request failed (${res.status})`
        );
      }
      if (!res.ok || data.status !== "success") {
        throw new Error(
          typeof data.message === "string" && data.message.length > 0
            ? data.message
            : `Could not load payouts (${res.status})`
        );
      }
      setPayload(data);
      setError(null);
    } catch (e) {
      setPayload(null);
      setError(e instanceof Error ? e.message : "Could not load payouts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openStripeExpressDashboard() {
    setStripeOpening(true);
    try {
      const res = await fetch("/api/partner/stripe/express-login", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { status?: string; url?: string; message?: string };
      if (!res.ok || data.status !== "success" || !data.url) {
        throw new Error(data.message || "Could not open Stripe");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stripe dashboard failed");
      setStripeOpening(false);
    }
  }

  const sortedPayouts = payload?.payouts?.length
    ? [...payload.payouts].sort(
        (a, b) => (b.created || 0) - (a.created || 0)
      )
    : [];

  const totalPaidUsd = payload?.summary?.lifetimePaidUsd ?? 0;
  const yearPaidUsd = payload?.summary?.yearPaidUsd ?? 0;
  const yearLabel = new Date().getFullYear();

  const np = payload?.nextPayout;
  const availableUsdEntry = payload?.balance?.available?.find(
    (b) => (b.currency || "").toLowerCase() === "usd"
  );
  const availableUsd =
    availableUsdEntry != null ? availableUsdEntry.amountCents / 100 : null;

  const nextAmountDisplay = np
    ? formatMajor(np.amountCents, np.currency)
    : availableUsd != null && availableUsd > 0
      ? formatMajor(Math.round(availableUsd * 100), "usd")
      : "$0.00";

  const nextSubtitle = np
    ? np.arrivalDate
      ? `Expected arrival · ${new Date(`${np.arrivalDate}T12:00:00`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`
      : "Processing payout"
    : availableUsd != null && availableUsd > 0
      ? "Available Stripe balance (settles on Stripe’s payout schedule)"
      : "No pending payout";

  const heroBadgeLabel = np ? nextHeroBadge(np.status) : "Balance";

  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripeConnectedAt, setStripeConnectedAt] = useState<string | null>(null);

  useEffect(() => {
    setStripeAccountId(localStorage.getItem("packpally_stripe_account_id"));
    setStripeConnectedAt(
      localStorage.getItem("packpally_stripe_connected_at")
    );
  }, []);

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Payouts
        </h1>
        <p className="mt-1 text-muted-foreground max-w-2xl">
          Trip payments use Stripe Connect destination charges. Stripe transfers
          funds to your Express account; periodic payouts go to your linked bank.
          Data below comes directly from Stripe.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 gap-2"
              disabled={loading}
              onClick={() => void load()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Retrying…" : "Retry"}
            </Button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <StripeAccountCard
          accountId={stripeAccountId}
          connectedAt={stripeConnectedAt}
          variant="comfortable"
        />
      </div>

      {loading && !error ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading payouts…
        </div>
      ) : !loading && payload && !payload.connected ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 mb-8">
          <p className="font-semibold text-amber-950">Connect Stripe to receive payouts</p>
          <p className="text-sm text-amber-900/90 mt-1">
            Complete Stripe Express onboarding so booking revenue can reach your bank.
          </p>
          <Button asChild className="mt-4">
            <Link href="/partner/onboarding/stripe">Connect Stripe</Link>
          </Button>
        </div>
      ) : null}

      {!loading && payload?.connected && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-8">
            <div className="lg:col-span-2 rounded-2xl border bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium opacity-90">
                    {np ? "Next payout" : "Stripe balance"}
                  </span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {heroBadgeLabel}
                </Badge>
              </div>

              <p className="text-4xl font-extrabold tracking-tight">
                {nextAmountDisplay}
              </p>
              <p className="text-sm opacity-80 mt-1">{nextSubtitle}</p>

              <Separator className="my-5 bg-white/20" />

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="opacity-60 text-xs">In flight (USD)</p>
                  <p className="font-bold text-lg">
                    {formatMajor(
                      Math.round((payload.summary.pendingOrInTransitUsd || 0) * 100),
                      "usd"
                    )}
                  </p>
                </div>
                <div>
                  <p className="opacity-60 text-xs">Expected / arrival</p>
                  <p className="font-bold text-lg">
                    {np?.arrivalDate
                      ? new Date(`${np.arrivalDate}T12:00:00`).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="opacity-60 text-xs">Rail</p>
                  <p className="font-bold text-lg">
                    {np ? formatPayoutMethod(np.method || "standard") : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border bg-white p-5">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-muted-foreground">Total paid out</p>
                </div>
                <p className="text-2xl font-bold">{formatMajor(totalPaidUsd * 100, "usd")}</p>
                <p className="text-xs text-muted-foreground mt-1">Lifetime (USD payouts)</p>
              </div>

              <div className="rounded-2xl border bg-white p-5">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">This year</p>
                </div>
                <p className="text-2xl font-bold">
                  {formatMajor(yearPaidUsd * 100, "usd")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Paid Stripe payouts in {yearLabel} (USD)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-8">
            <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
              <h3 className="font-bold mb-4">Payment method</h3>
              <div className="flex items-center justify-between rounded-xl border p-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">Bank account</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {payload.bankDisplay
                        ? `${payload.bankDisplay.bankName} · •••• ${payload.bankDisplay.last4}`
                        : "Manage bank details in Stripe"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={stripeOpening}
                  onClick={() => void openStripeExpressDashboard()}
                >
                  {stripeOpening ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                After charges settle to your connected account, Stripe sends payouts
                to your bank on its payout schedule (timezone and holidays apply).
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h3 className="font-bold mb-2">Tax &amp; documents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tax forms and verification live in your Stripe Express Dashboard.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                type="button"
                disabled={stripeOpening}
                onClick={() => void openStripeExpressDashboard()}
              >
                <FileText className="h-4 w-4" />
                Open Stripe
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold">Payout history</h3>
                <p className="text-sm text-muted-foreground">
                  {sortedPayouts.length
                    ? `Last ${sortedPayouts.length} payouts from Stripe`
                    : "No payouts yet"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0"
                type="button"
                disabled={sortedPayouts.length === 0}
                onClick={() => downloadPayoutsCsv(sortedPayouts)}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>

            <div className="border-t">
              <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_100px_120px] gap-4 px-6 py-3 text-xs font-semibold text-muted-foreground bg-muted/30 uppercase tracking-wider">
                <div>Period</div>
                <div>Reference</div>
                <div>Method</div>
                <div>Status</div>
                <div className="text-right">Amount</div>
              </div>

              <div className="divide-y">
                {sortedPayouts.map((payout) => {
                  const ui = payoutUiStatus(payout.status);
                  const config = getStatusConfig(ui);
                  const dateStr = payout.arrivalDate
                    ? new Date(`${payout.arrivalDate}T12:00:00`).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )
                    : new Date((payout.created || 0) * 1000).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      );
                  return (
                    <div
                      key={payout.id}
                      className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_100px_120px] gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-sm">{periodLabel(payout)}</p>
                        <p className="text-xs text-muted-foreground">{dateStr}</p>
                      </div>
                      <div className="hidden sm:block font-mono text-xs text-muted-foreground truncate">
                        {payout.id}
                      </div>
                      <div className="text-sm hidden sm:flex items-center gap-1.5 text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5 shrink-0" />
                        {formatPayoutMethod(payout.method)}
                      </div>
                      <div>
                        <Badge className={cn("text-xs", config.class)}>
                          {config.label}
                        </Badge>
                        {payout.failureMessage ? (
                          <p className="text-xs text-red-600 mt-1 max-w-[140px]">
                            {payout.failureMessage}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right col-span-2 sm:col-span-1">
                        <p className="font-bold">
                          {formatMajor(payout.amountCents, payout.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
