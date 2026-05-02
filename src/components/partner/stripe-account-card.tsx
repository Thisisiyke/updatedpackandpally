"use client";

import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  accountId: string | null;
  connectedAt: string | null;
  /** Compact = mobile (smaller spacing). Defaults to compact when used on mobile. */
  variant?: "compact" | "comfortable";
}

export function StripeAccountCard({
  accountId,
  connectedAt,
  variant = "compact",
}: Props) {
  const isCompact = variant === "compact";
  return (
    <div
      className={
        isCompact
          ? "rounded-2xl border bg-white p-4"
          : "rounded-2xl border bg-white p-5"
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={
              isCompact
                ? "flex h-10 w-10 items-center justify-center rounded-xl bg-[#635BFF]/10 shrink-0"
                : "flex h-12 w-12 items-center justify-center rounded-xl bg-[#635BFF]/10 shrink-0"
            }
          >
            <span
              className={
                isCompact
                  ? "text-[#635BFF] text-sm font-bold tracking-tight"
                  : "text-[#635BFF] text-base font-bold tracking-tight"
              }
            >
              stripe
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p
                className={
                  isCompact ? "font-bold text-sm" : "font-bold"
                }
              >
                Connected Stripe account
              </p>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-[9px]">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Active
              </Badge>
            </div>
            <p
              className={
                isCompact
                  ? "text-[10px] text-muted-foreground font-mono mt-0.5 truncate"
                  : "text-xs text-muted-foreground font-mono mt-1 truncate"
              }
            >
              {accountId || "acct_•••••••••••"}
            </p>
            <div
              className={
                isCompact
                  ? "mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground"
                  : "mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"
              }
            >
              {connectedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Connected{" "}
                  {new Date(connectedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Identity verified · Bank verified
              </span>
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className={isCompact ? "w-full mt-3 gap-1.5" : "mt-4 gap-1.5"}
        onClick={() =>
          window.alert(
            "In production, this opens dashboard.stripe.com to manage your account."
          )
        }
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Manage in Stripe
      </Button>
    </div>
  );
}
