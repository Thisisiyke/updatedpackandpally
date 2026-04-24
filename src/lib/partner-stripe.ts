export const STRIPE_CONNECTED_KEY = "packpally_stripe_connected";

export function isStripeConnected(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STRIPE_CONNECTED_KEY) === "true";
  } catch {
    return false;
  }
}

export function markStripeConnected(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STRIPE_CONNECTED_KEY, "true");
    localStorage.setItem(
      "packpally_stripe_account_id",
      `acct_${Math.random().toString(36).slice(2, 18)}`
    );
    localStorage.setItem(
      "packpally_stripe_connected_at",
      new Date().toISOString()
    );
  } catch {}
}

export function disconnectStripe(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STRIPE_CONNECTED_KEY);
    localStorage.removeItem("packpally_stripe_account_id");
    localStorage.removeItem("packpally_stripe_connected_at");
  } catch {}
}

/**
 * Sanitize a ?next= value so onboarding can only bounce users back to internal
 * partner paths — never to an external URL.
 */
export function safePartnerNext(
  next: string | null | undefined,
  fallback = "/partner"
): string {
  if (!next) return fallback;
  if (!next.startsWith("/partner")) return fallback;
  if (next.startsWith("/partner/onboarding")) return fallback;
  return next;
}
