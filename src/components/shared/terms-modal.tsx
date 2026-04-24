"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Shield, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type BookingType = "trip" | "flight" | "hotel";

export interface CustomTerms {
  title?: string;
  content: string;
  authorName?: string;
  updatedAt?: string;
}

export function TermsModal({
  open,
  onClose,
  onAccept,
  bookingType = "trip",
  processing = false,
  customTerms,
}: {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  bookingType?: BookingType;
  processing?: boolean;
  customTerms?: CustomTerms | null;
}) {
  const [agreed, setAgreed] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset on open/close
  useEffect(() => {
    if (!open) {
      setAgreed(false);
      setScrolledToEnd(false);
    }
  }, [open]);

  // If content fits without scrolling, mark as read immediately
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.clientHeight < 30) {
      setScrolledToEnd(true);
    }
  }, [open, customTerms]);

  // Detect when user scrolls to the bottom of the terms
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
    if (atBottom) setScrolledToEnd(true);
  };

  if (!open) return null;

  const canAccept = agreed && scrolledToEnd;

  const heading =
    customTerms?.title?.trim() ||
    (bookingType === "flight"
      ? "Flight Booking Terms"
      : bookingType === "hotel"
      ? "Stay Booking Terms"
      : "Trip Booking Terms");

  const subheading = customTerms?.authorName
    ? `From ${customTerms.authorName} — please review and accept before continuing`
    : "Please review and accept before continuing";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
        onClick={processing ? undefined : onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-lg rounded-2xl bg-white shadow-2xl pointer-events-auto animate-[pop-in_300ms_cubic-bezier(0.16,1,0.3,1)] flex flex-col max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold">{heading}</h2>
                <p className="text-xs text-muted-foreground">{subheading}</p>
              </div>
            </div>
            {!processing && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Scrollable terms */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm text-muted-foreground leading-relaxed"
          >
            {customTerms ? (
              <>
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-xs text-foreground/80">
                  These are the host&apos;s own terms for this trip. Pack &amp;
                  Pally&apos;s platform terms apply in addition.
                </div>
                <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed font-sans">
                  {customTerms.content}
                </div>
                {customTerms.updatedAt && (
                  <p className="text-[11px] text-muted-foreground/80 pt-2 border-t">
                    Last updated:{" "}
                    {new Date(customTerms.updatedAt).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </p>
                )}
              </>
            ) : (
              <>
            <section>
              <h3 className="font-bold text-foreground text-sm mb-1.5">
                1. Booking Agreement
              </h3>
              <p>
                By confirming this booking, you (the &quot;Traveler&quot;) agree to
                engage Pack &amp; Pally to facilitate the booking of the travel
                services described at checkout. Pack &amp; Pally acts as a
                booking platform connecting travelers with independent hosts
                and partners and is not the provider of the underlying travel
                services.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground text-sm mb-1.5">
                2. Payment
              </h3>
              <p>
                The total amount shown at checkout, inclusive of taxes and
                platform fees, is charged to your payment method upon booking
                confirmation. A receipt and booking confirmation will be sent
                to the email address provided.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground text-sm mb-1.5">
                3. Cancellation
              </h3>
              <p>
                {bookingType === "flight"
                  ? "Cancellations and changes are subject to the fare rules of the chosen airline. Non-refundable fares may incur full forfeit. Refundable fares may be cancelled up to 24 hours before departure for a full refund minus processing fees."
                  : bookingType === "hotel"
                  ? "Cancellation terms are set by the stay provider and shown on the booking page before you confirm."
                  : "The host's cancellation policy is a separate document shown on the trip page. These Terms cover everything except refund windows — review the cancellation policy for refund rules specific to this trip."}
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground text-sm mb-1.5">
                4. Host & Traveler Responsibilities
              </h3>
              <p>
                Hosts are responsible for delivering the services described in
                the listing. Travelers are responsible for holding valid
                travel documents (passport, visa, insurance), arriving on
                time, and conducting themselves responsibly and respectfully.
                Violations may result in removal from the trip without refund.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground text-sm mb-1.5">
                5. Travel Insurance
              </h3>
              <p>
                Travel insurance is{" "}
                <strong className="text-foreground">strongly recommended</strong>{" "}
                and is your responsibility to arrange. Insurance is not
                included in the price unless explicitly stated.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground text-sm mb-1.5">
                6. Changes & Force Majeure
              </h3>
              <p>
                Itineraries may change due to weather, safety considerations,
                or unforeseen circumstances. Pack &amp; Pally and the host
                reserve the right to make reasonable adjustments. In the
                event of force majeure (natural disaster, political
                instability, etc.), cancellation policies may be relaxed at
                our sole discretion.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground text-sm mb-1.5">
                7. Code of Conduct
              </h3>
              <p>
                Travelers agree to treat fellow travelers, hosts, and locals
                with respect. Harassment, discrimination, illegal activity,
                and substance abuse are strictly prohibited and will result
                in immediate removal without refund.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground text-sm mb-1.5">
                8. Limitation of Liability
              </h3>
              <p>
                To the maximum extent permitted by law, Pack &amp; Pally&apos;s
                total liability is limited to the total amount paid by the
                traveler for the affected booking. Pack &amp; Pally is not
                liable for indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground text-sm mb-1.5">
                9. Data & Privacy
              </h3>
              <p>
                Your personal data is handled in accordance with our Privacy
                Policy. By accepting these terms, you also consent to our
                data practices outlined therein.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground text-sm mb-1.5">
                10. Governing Law
              </h3>
              <p>
                These terms are governed by the laws of the jurisdiction in
                which Pack &amp; Pally is incorporated. Disputes will be
                resolved through binding arbitration.
              </p>
              <p className="mt-4 text-[11px] text-muted-foreground/80">
                Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.
              </p>
            </section>
              </>
            )}
          </div>

          {/* Scroll-to-read nudge */}
          {!scrolledToEnd && (
            <div className="border-t bg-amber-50 px-5 py-2 text-[11px] text-amber-900 flex items-center gap-2">
              <Shield className="h-3 w-3 shrink-0" />
              Scroll to the end to review all terms before accepting.
            </div>
          )}

          {/* Agreement + actions */}
          <div className="border-t p-5 space-y-3">
            <label
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-all",
                !scrolledToEnd
                  ? "bg-muted/30 opacity-60 cursor-not-allowed"
                  : agreed
                  ? "bg-primary/5 border-primary/30"
                  : "hover:bg-muted/30 cursor-pointer"
              )}
            >
              <Checkbox
                checked={agreed}
                disabled={!scrolledToEnd}
                onCheckedChange={(v) => setAgreed(!!v)}
                className="mt-0.5"
              />
              <span className="text-sm">
                I have read and agree to the{" "}
                <span className="font-semibold">{heading}</span>, the{" "}
                <span className="text-primary font-medium">
                  cancellation policy
                </span>
                , and the{" "}
                <span className="text-primary font-medium">privacy policy</span>.
              </span>
            </label>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-1.5"
                disabled={!canAccept || processing}
                onClick={onAccept}
              >
                {processing ? (
                  "Processing..."
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Accept & continue
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

