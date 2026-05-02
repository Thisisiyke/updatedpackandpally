/** Row from wanderly `GET /stripeConnect/payouts`. */
export type PartnerStripePayoutRow = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  arrivalDate: string | null;
  created: number;
  method: string;
  description: string | null;
  failureMessage: string | null;
};

/** Success payload from `/api/partner/payouts`. */
export type PartnerPayoutsApiOk = {
  status: "success";
  connected: boolean;
  stripeAccountId: string | null;
  payouts: PartnerStripePayoutRow[];
  balance: {
    available: Array<{ amountCents: number; currency: string }>;
    pending: Array<{ amountCents: number; currency: string }>;
  } | null;
  bankDisplay: { bankName: string; last4: string } | null;
  summary: {
    lifetimePaidUsd: number;
    yearPaidUsd: number;
    pendingOrInTransitUsd: number;
  };
  nextPayout: {
    amountCents: number;
    currency: string;
    status: string;
    method: string;
    arrivalDate: string | null;
  } | null;
};
