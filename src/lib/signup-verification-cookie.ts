import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

import { cookieBaseOptions } from "@/lib/wanderly-cookies";

const KEY_LEN = 32;
const IV_LEN = 16;
const TAG_LEN = 16;
const ALGO = "aes-256-gcm";

/** Pending OTP + email after send-email (httpOnly). */
export const PP_SIGNUP_PENDING_COOKIE = "pp_signup_pending";
/** Email verified, OK to call signupDetails (httpOnly). */
export const PP_SIGNUP_VERIFIED_COOKIE = "pp_signup_verified";

function deriveKey(): Buffer {
  const secret =
    process.env.SIGNUP_VERIFY_SECRET ||
    process.env.AUTH_SECRET ||
    "packpally-dev-signup-verify-change-in-production";
  return scryptSync(secret, "pp-signup-v1", KEY_LEN);
}

export function sealSignupBlob(payload: Record<string, unknown>): string {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, deriveKey(), iv);
  const raw = Buffer.from(JSON.stringify(payload), "utf8");
  const enc = Buffer.concat([cipher.update(raw), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function unsealSignupBlob<T extends Record<string, unknown>>(token: string): T | null {
  try {
    const buf = Buffer.from(token, "base64url");
    if (buf.length < IV_LEN + TAG_LEN + 1) return null;
    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const enc = buf.subarray(IV_LEN + TAG_LEN);
    const decipher = createDecipheriv(ALGO, deriveKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return JSON.parse(dec.toString("utf8")) as T;
  } catch {
    return null;
  }
}

export const signupPendingCookieOpts = {
  ...cookieBaseOptions,
  maxAge: 15 * 60,
};

export const signupVerifiedCookieOpts = {
  ...cookieBaseOptions,
  maxAge: 30 * 60,
};
