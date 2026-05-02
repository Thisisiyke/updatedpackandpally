"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CreditCard,
  Download,
  ChevronRight,
  FileText,
  Banknote,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { partnerPayouts, getPartnerStats } from "@/data/partner-listings";
import { StripeAccountCard } from "@/components/partner/stripe-account-card";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function getStatusConfig(status: string) {
  switch (status) {
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
        label: "Processing",
        class: "bg-blue-100 text-blue-800 border-blue-200",
      };
    default:
      return { label: status, class: "" };
  }
}

export default function PartnerPayoutsPage() {
  const stats = getPartnerStats();
  const sortedPayouts = [...partnerPayouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const nextPayout = sortedPayouts.find((p) => p.status === "pending");
  const recentPaid = sortedPayouts.filter((p) => p.status === "paid").slice(0, 3);
  const totalPaid = partnerPayouts
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

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
        <p className="mt-1 text-muted-foreground">
          Track your earnings and payment history
        </p>
      </div>

      {/* Stripe Connect account */}
      <div className="mb-6">
        <StripeAccountCard
          accountId={stripeAccountId}
          connectedAt={stripeConnectedAt}
          variant="comfortable"
        />
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-8">
        {/* Next payout - big card */}
        <div className="lg:col-span-2 rounded-2xl border bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium opacity-90">
                Next payout
              </span>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Pending
            </Badge>
          </div>

          <p className="text-4xl font-extrabold tracking-tight">
            {nextPayout ? formatCurrency(nextPayout.amount) : "$0.00"}
          </p>
          <p className="text-sm opacity-80 mt-1">
            {nextPayout?.period || "No pending payout"}
          </p>

          <Separator className="my-5 bg-white/20" />

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="opacity-60 text-xs">Bookings</p>
              <p className="font-bold text-lg">{nextPayout?.bookings || 0}</p>
            </div>
            <div>
              <p className="opacity-60 text-xs">Expected</p>
              <p className="font-bold text-lg">
                {nextPayout
                  ? new Date(nextPayout.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div>
              <p className="opacity-60 text-xs">Method</p>
              <p className="font-bold text-lg">{nextPayout?.method || "—"}</p>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <p className="text-sm text-muted-foreground">Total earned</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">This year</p>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(
                partnerPayouts
                  .filter(
                    (p) =>
                      p.status === "paid" &&
                      new Date(p.date).getFullYear() === 2026
                  )
                  .reduce((s, p) => s + p.amount, 0)
              )}
            </p>
            <p className="text-xs text-emerald-600 mt-1">+18% vs last year</p>
          </div>
        </div>
      </div>

      {/* Payment method & documents row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-8">
        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <h3 className="font-bold mb-4">Payment method</h3>
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">
                  Chase Bank · •••• 4829
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Payouts are released 24 hours after guest check-in. They typically
            arrive in your account within 3-5 business days.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h3 className="font-bold mb-4">Documents</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Tax statement 2025</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>W-9 form</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Payment agreement</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Payout history */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Payout history</h3>
            <p className="text-sm text-muted-foreground">
              Last {partnerPayouts.length} payouts
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="border-t">
          <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_120px] gap-4 px-6 py-3 text-xs font-semibold text-muted-foreground bg-muted/30 uppercase tracking-wider">
            <div>Period</div>
            <div>Bookings</div>
            <div>Method</div>
            <div>Status</div>
            <div className="text-right">Amount</div>
          </div>

          <div className="divide-y">
            {sortedPayouts.map((payout) => {
              const config = getStatusConfig(payout.status);
              return (
                <div
                  key={payout.id}
                  className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1fr_120px] gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-sm">{payout.period}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payout.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-sm hidden sm:block">
                    {payout.bookings} bookings
                  </div>
                  <div className="text-sm hidden sm:flex items-center gap-1.5 text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    {payout.method}
                  </div>
                  <div>
                    <Badge className={cn("text-xs", config.class)}>
                      {config.label}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(payout.amount)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
