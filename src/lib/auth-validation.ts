/**
 * Client-side validation aligned with wanderly-1 `secureValidate.js`
 * (signupDetails uses validateName / validateEmail / validatePassword).
 */

export function validateSignupName(name: string): boolean {
  if (name == null || typeof name !== "string") return false;
  const t = name.trim();
  if (t.length < 2 || t.length > 50) return false;
  return /^[\p{L}\s'-]{2,50}$/u.test(t);
}

export function validateSignupEmail(email: string): boolean {
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicRegex.test(email)) return false;
  const unsafeChars = /[<>#*(){}[\]]/;
  if (unsafeChars.test(email)) return false;
  return true;
}

export function validateSignupPassword(password: string): boolean {
  if (password == null || typeof password !== "string") return false;
  return password.length >= 6 && password.length <= 128;
}
