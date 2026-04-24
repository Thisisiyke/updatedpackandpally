"use client";

import { Ban, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CANCELLATION_PRESETS,
  type CancellationPolicy,
} from "@/lib/host-terms";

interface Props {
  open: boolean;
  onClose: () => void;
  policy: CancellationPolicy;
  hostName?: string;
}

export function CancellationPolicyModal({
  open,
  onClose,
  policy,
  hostName,
}: Props) {
  if (!open) return null;

  const preset =
    policy.preset !== "custom" ? CANCELLATION_PRESETS[policy.preset] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl pointer-events-auto animate-[pop-in_300ms_cubic-bezier(0.16,1,0.3,1)] flex flex-col max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Ban className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h2 className="font-bold">Cancellation policy</h2>
                <p className="text-xs text-muted-foreground">
                  {hostName
                    ? `Set by ${hostName}`
                    : "Set by the trip host"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {preset ? (
              <>
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                    {preset.label}
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {preset.headline}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Refund windows
                  </p>
                  <ul className="space-y-2">
                    {preset.windows.map((w, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                  Custom policy
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/85 leading-relaxed">
                  {policy.customText ||
                    "The host has set a custom policy. Ask the host for details before booking."}
                </p>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Refunds are issued to your original payment method and can take
              5–10 business days to appear. Cancellation policies live
              separately from Pack &amp; Pally&apos;s platform terms.
            </p>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <Button onClick={onClose} className="w-full">
              Got it
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
