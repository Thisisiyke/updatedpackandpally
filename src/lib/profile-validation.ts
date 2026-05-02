/** Mirrors wanderly-1 `secureValidate` + mobile AdminProfile rules for profile edits. */

const NAME_RE = /^[A-Za-z\s'-]{2,50}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[0-9]{7,15}$/;

export function validateProfileFirstName(v: string): boolean {
  return NAME_RE.test(v.trim());
}

export function validateProfileLastName(v: string): boolean {
  return NAME_RE.test(v.trim());
}

export function validateProfileEmail(v: string): boolean {
  const t = v.trim();
  if (!EMAIL_RE.test(t)) return false;
  return !/[<>#*(){}[\]]/.test(t);
}

/** Optional: empty allowed; otherwise 7–15 digits. */
export function validateProfilePhone(v: string): boolean {
  const t = v.trim();
  if (!t) return true;
  return MOBILE_RE.test(t);
}

export function validateProfileBio(v: string): boolean {
  const clean = v.replace(/<[^>]*>/g, "").trim();
  return clean.length <= 300;
}

export function validateProfilePassword(v: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
}
