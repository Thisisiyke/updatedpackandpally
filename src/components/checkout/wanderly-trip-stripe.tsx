"use client";

import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
export const wanderlyStripePromise = pk ? loadStripe(pk) : null;

export function WanderlyTripStripeRoot({
  clientSecret,
  children,
}: {
  clientSecret: string;
  children: React.ReactNode;
}) {
  if (!wanderlyStripePromise) {
    return <>{children}</>;
  }
  return (
    <Elements stripe={wanderlyStripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
}

export function WanderlyPaymentSection() {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-sm font-medium mb-3">Card payment (Stripe)</p>
      <PaymentElement />
    </div>
  );
}

export function WanderlyConfirmPaymentButton({
  label,
  disabled,
  onPaid,
}: {
  label: string;
  disabled?: boolean;
  onPaid: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handle() {
    if (!stripe || !elements || disabled) return;
    setBusy(true);
    setErr("");
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setBusy(false);
    if (error) {
      setErr(error.message || "Payment failed");
      return;
    }
    if (paymentIntent?.status === "succeeded" && paymentIntent.id) {
      onPaid(paymentIntent.id);
    }
  }

  return (
    <>
      {err ? <p className="text-sm text-red-600 mb-2">{err}</p> : null}
      <Button
        type="button"
        className="w-full h-12 gap-2"
        size="lg"
        onClick={handle}
        disabled={disabled || busy || !stripe}
      >
        {busy ? "Processing..." : label}
      </Button>
    </>
  );
}
