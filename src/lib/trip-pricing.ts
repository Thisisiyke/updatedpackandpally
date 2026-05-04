export interface PriceTiers {
  solo: number;
  couple: number;
  groupOf3: number;
}

/**
 * Given a base price, optional tiered pricing, and a number of travelers,
 * returns the per-person rate that applies.
 */
export function perPersonRate(
  basePrice: number,
  tiers: PriceTiers | undefined,
  travelers: number
): number {
  if (!tiers) return basePrice;
  if (travelers <= 1) return tiers.solo;
  if (travelers === 2) return tiers.couple;
  return tiers.groupOf3;
}

/**
 * Total cost of the booking given travelers + pricing.
 */
export function tripTotal(
  basePrice: number,
  tiers: PriceTiers | undefined,
  travelers: number
): number {
  return perPersonRate(basePrice, tiers, travelers) * Math.max(1, travelers);
}

/**
 * Pack & Pally's pricing rules applied at checkout:
 *   • Tax — host-configurable per trip. Defaults to 8.25% across the platform.
 *   • Platform fee — always 6%, Pack & Pally's cut. Non-configurable.
 */
export const TAX_RATE_DEFAULT = 0.0825;
export const PLATFORM_FEE_RATE = 0.03;

export interface PriceBreakdown {
  subtotal: number;
  taxRate: number;
  tax: number;
  platformFeeRate: number;
  platformFee: number;
  total: number;
}

export function calculatePriceBreakdown(
  subtotal: number,
  taxRate: number = TAX_RATE_DEFAULT
): PriceBreakdown {
  const safeSubtotal = Math.max(0, subtotal);
  const tax = Math.round(safeSubtotal * taxRate);
  const platformFee = Math.round(safeSubtotal * PLATFORM_FEE_RATE);
  return {
    subtotal: safeSubtotal,
    taxRate,
    tax,
    platformFeeRate: PLATFORM_FEE_RATE,
    platformFee,
    total: safeSubtotal + tax + platformFee,
  };
}

/**
 * Format a tax-rate decimal (0.0825) as a human label ("8.25%").
 * Trims trailing zeros so 0.08 renders as "8%" not "8.00%".
 */
export function formatRatePercent(rate: number): string {
  const pct = rate * 100;
  return `${Number(pct.toFixed(2))}%`;
}
