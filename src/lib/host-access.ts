import type { PackPallyUser } from "@/types/packpally-user";
import { isStripeConnected } from "@/lib/partner-stripe";

/**
 * Whether the session user should see host / partner UX.
 * Wanderly Register records often omit `role`; approved hosts use `isVerified: "verified"`,
 * and partner onboarding sets `stripeId` or the client marks Stripe Connect in localStorage.
 */
export function isPackPallyHostUser(
  user: PackPallyUser | null | undefined
): boolean {
  if (!user || user.role === "guest") return false;
  if ((user.role || "").toLowerCase() === "host") return true;
  if (String(user.isVerified || "").toLowerCase() === "verified") return true;
  if (Boolean(user.stripeId?.trim())) return true;
  if (isStripeConnected()) return true;
  return false;
}
