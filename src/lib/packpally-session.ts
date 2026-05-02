import type { PackPallyUser } from "@/types/packpally-user";
import {
  cookieBaseOptions,
  PP_USER_COOKIE,
  WANDERLY_ACCESS_COOKIE,
  WANDERLY_REFRESH_COOKIE,
} from "@/lib/wanderly-cookies";

export type CookieStore = Awaited<
  ReturnType<typeof import("next/headers").cookies>
>;

/** wanderly-1 user object (login / signup / oauth). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapWanderlyUserToPackPally(user: any): PackPallyUser {
  return {
    id: user._id,
    name:
      user.fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Traveler",
    email: user.email || "",
    image: user.profileImage ?? null,
    role: user.role || "traveler",
    isVerified: user.isVerified,
    stripeId: user.stripeId,
    stripeOnboardingComplete: user.stripeOnboardingComplete === true ? true : undefined,
  };
}

export function setPackPallyAuthCookies(
  jar: Pick<CookieStore, "set">,
  data: {
    token: string;
    refreshToken?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
  }
) {
  const safeUser = mapWanderlyUserToPackPally(data.user);
  jar.set(WANDERLY_ACCESS_COOKIE, data.token, {
    ...cookieBaseOptions,
    maxAge: 15 * 60,
  });
  if (data.refreshToken) {
    jar.set(WANDERLY_REFRESH_COOKIE, data.refreshToken, {
      ...cookieBaseOptions,
      maxAge: 30 * 24 * 60 * 60,
    });
  }
  jar.set(PP_USER_COOKIE, JSON.stringify(safeUser), {
    ...cookieBaseOptions,
    maxAge: 30 * 24 * 60 * 60,
  });
}

/** Refresh only the Pack & Pally user cookie after profile / avatar updates (tokens unchanged). */
export function setPackPallyUserCookieOnly(
  jar: Pick<CookieStore, "set">,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wanderlyUser: any
) {
  const safeUser = mapWanderlyUserToPackPally(wanderlyUser);
  jar.set(PP_USER_COOKIE, JSON.stringify(safeUser), {
    ...cookieBaseOptions,
    maxAge: 30 * 24 * 60 * 60,
  });
}

/** Decode JWT payload without verifying signature (used for routing / BFF hints). */
export function decodeJwtPayload<T extends object>(jwt: string): T | null {
  try {
    const part = jwt.split(".")[1];
    if (!part) return null;
    try {
      const json = Buffer.from(part, "base64url").toString("utf8");
      return JSON.parse(json) as T;
    } catch {
      const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
      const pad = b64.length % 4;
      const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
      const json = Buffer.from(padded, "base64").toString("utf8");
      return JSON.parse(json) as T;
    }
  } catch {
    return null;
  }
}
