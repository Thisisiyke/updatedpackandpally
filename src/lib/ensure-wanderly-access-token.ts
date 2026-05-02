import "server-only";

import { cookies } from "next/headers";
import { wanderlyUrl } from "@/lib/wanderly-config";
import {
  cookieBaseOptions,
  WANDERLY_ACCESS_COOKIE,
  WANDERLY_REFRESH_COOKIE,
} from "@/lib/wanderly-cookies";

/**
 * Returns a usable Wanderly access token: existing cookie, or a new one from refresh.
 * Sets the access cookie when refresh succeeds. Returns the token string so callers can
 * attach Authorization in the same request (cookie store may not re-read immediately).
 */
export async function getWanderlyAccessTokenForBff(): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(WANDERLY_ACCESS_COOKIE)?.value;
  if (existing) {
    return existing;
  }

  const refresh = jar.get(WANDERLY_REFRESH_COOKIE)?.value;
  if (!refresh) {
    return null;
  }

  try {
    const res = await fetch(wanderlyUrl("/signUp/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      accessToken?: string;
    };
    if (!res.ok || !data.accessToken) {
      return null;
    }
    jar.set(WANDERLY_ACCESS_COOKIE, data.accessToken, {
      ...cookieBaseOptions,
      maxAge: 15 * 60,
    });
    return data.accessToken;
  } catch {
    return null;
  }
}
