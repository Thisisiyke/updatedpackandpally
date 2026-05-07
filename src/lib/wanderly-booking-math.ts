/**
 * Matches wanderly mobile `TripDetailsScreen` fee math for Stripe + book-trip.
 * fullAmt = (price + tripTax) * travelers
 * partial = 20% of fullAmt
 * Grand = base + 3% service + 8.25% tax on base
 */

export function wanderlyBookingAmounts(
  pricePerPerson: number,
  tripTaxPerPerson: number,
  travelers: number
) {
  const fullAmt = (Number(pricePerPerson) + Number(tripTaxPerPerson)) * travelers;
  const partialAmt = fullAmt * 0.2;
  const svc = 0.03;
  const tax = 0.0825;
  const GrandFullAmt = fullAmt + fullAmt * svc + fullAmt * tax;
  const GrandpartialAmt = partialAmt + partialAmt * svc + partialAmt * tax;
  return {
    fullAmt,
    partialAmt,
    GrandFullAmt: Number(GrandFullAmt.toFixed(2)),
    GrandpartialAmt: Number(GrandpartialAmt.toFixed(2)),
    fullAmtServiceFee: Number((fullAmt * svc).toFixed(2)),
    partialAmtServiceFee: Number((partialAmt * svc).toFixed(2)),
    fullAmtTax: Number((fullAmt * tax).toFixed(2)),
    partialAmtTax: Number((partialAmt * tax).toFixed(2)),
  };
}

export function schedulePayDateOneWeekBefore(startDateYmd: string): string {
  const [y, m, d] = startDateYmd.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() - 7);
  const yyyy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
