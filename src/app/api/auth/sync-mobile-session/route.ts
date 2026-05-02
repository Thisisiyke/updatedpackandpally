import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wanderlyUrl } from "@/lib/wanderly-config";
import {
  decodeJwtPayload,
  mapWanderlyUserToPackPally,
  setPackPallyAuthCookies,
} from "@/lib/packpally-session";

type SyncBody = {
  accessToken?: string;
  refreshToken?: string;
};

async function wanderlyRefresh(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(wanderlyUrl("/signUp/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      accessToken?: string;
    };
    if (!res.ok || !data.accessToken) return null;
    return data.accessToken;
  } catch {
    return null;
  }
}

async function wanderlyGetLoginData(
  accessToken: string,
  email: string
): Promise<Response> {
  return fetch(wanderlyUrl("/signUp/getLoginData"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

function normalizeEmail(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

/**
 * Called from the Wanderly app WebView (same-origin page). Exchanges the native
 * app's Wanderly JWT(s) for Pack & Pally session cookies so partner Stripe APIs work.
 */
export async function POST(req: Request) {
  let body: SyncBody;
  try {
    body = (await req.json()) as SyncBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let accessToken = String(body.accessToken ?? "").trim();
  const refreshToken = String(body.refreshToken ?? "").trim();

  if (!accessToken) {
    return NextResponse.json({ error: "accessToken required" }, { status: 400 });
  }

  let payload = decodeJwtPayload<{ email?: string }>(accessToken);
  let email = normalizeEmail(payload?.email);

  if (!email) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  let res = await wanderlyGetLoginData(accessToken, email);

  if ((!res.ok || res.status === 403 || res.status === 401) && refreshToken) {
    const refreshed = await wanderlyRefresh(refreshToken);
    if (refreshed) {
      accessToken = refreshed;
      payload = decodeJwtPayload<{ email?: string }>(accessToken);
      email = normalizeEmail(payload?.email);
      if (email) {
        res = await wanderlyGetLoginData(accessToken, email);
      }
    }
  }

  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    user?: Record<string, unknown>;
  };

  if (!res.ok || data.status !== "success" || !data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jar = await cookies();
  setPackPallyAuthCookies(jar, {
    token: accessToken,
    refreshToken: refreshToken || undefined,
    user: data.user,
  });

  const safe = mapWanderlyUserToPackPally(data.user);
  return NextResponse.json({ ok: true, user: safe });
}
