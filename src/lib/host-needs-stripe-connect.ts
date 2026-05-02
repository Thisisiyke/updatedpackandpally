import type { PackPallyUser } from "@/types/packpally-user";

/**
 * Returns true when the host still needs to act on Stripe Connect.
 * - stripeOnboardingComplete === true  → fully done, no action needed
 * - stripeId exists but not complete   → started but requirements pending ("Complete Setup")
 * - no stripeId                        → never started ("Connect Stripe")
 */
export function hostNeedsStripeConnect(
  user: PackPallyUser | null | undefined
): boolean {
  if (!user?.id) return false;
  if (user.role === "guest") return false;
  if (user.stripeOnboardingComplete === true) return false;
  return true;
}

/**
 * True when the host has started Stripe onboarding (stripeId written to DB)
 * but hasn't completed it yet (charges/payouts not enabled).
 * Used to show "Complete Setup" instead of "Connect Stripe".
 */
export function hostStripeIncomplete(
  user: PackPallyUser | null | undefined
): boolean {
  if (!hostNeedsStripeConnect(user)) return false;
  return Boolean(String(user?.stripeId ?? "").trim());
}
