import "server-only";

import { getWanderlyApiBaseUrl, wanderlyUrl } from "@/lib/wanderly-config";
import { getWanderlyAccessTokenForBff } from "@/lib/ensure-wanderly-access-token";

export type WanderlyRequestInit = RequestInit & {
  /** When false, do not attach Bearer from cookies (for login/signup). */
  withAuth?: boolean;
};

export async function wanderlyFetch(
  path: string,
  init: WanderlyRequestInit = {}
): Promise<Response> {
  const { withAuth = true, headers: hdrs, ...rest } = init;
  const headers = new Headers(hdrs);
  if (!headers.has("Content-Type") && rest.body && typeof rest.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (withAuth) {
    const token = await getWanderlyAccessTokenForBff();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return fetch(wanderlyUrl(path), { ...rest, headers });
}

export function isWanderlyConfigured(): boolean {
  try {
    return Boolean(getWanderlyApiBaseUrl());
  } catch {
    return false;
  }
}
