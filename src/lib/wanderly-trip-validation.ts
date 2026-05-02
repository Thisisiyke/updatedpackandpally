/**
 * Client-side checks aligned with wanderly-1 `secureValidate` for trip creation.
 * Keep regex/length rules in sync when updating the backend.
 */
export function validateWanderlyTripName(tripName: string): boolean {
  if (tripName == null || typeof tripName !== "string") return false;
  const t = tripName.trim();
  if (t.length < 2 || t.length > 100) return false;
  return /^[\p{L}\p{N}\s,'&:()!.+\-]{2,100}$/u.test(t);
}

export function validateWanderlyTripDescription(desc: string): boolean {
  const clean = desc.trim();
  return clean.length >= 1 && clean.length <= 1000;
}

export const WANDERLY_TRIP_NAME_HINT =
  "Use 2–100 characters: letters, numbers, spaces, and common punctuation (comma, apostrophe, hyphen, colon, parentheses, etc.).";
