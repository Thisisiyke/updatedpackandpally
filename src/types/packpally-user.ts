export type PackPallyUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  isVerified?: string;
  stripeId?: string;
  /** Written to DynamoDB by confirm-onboarding once charges_enabled + payouts_enabled are true. */
  stripeOnboardingComplete?: boolean;
};
