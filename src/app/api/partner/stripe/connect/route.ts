import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { setPackPallyUserCookieOnly } from "@/lib/packpally-session";
import { stripWanderlyUserSecrets } from "@/lib/wanderly-public-user";

/** Proxies Stripe Connect Express onboarding & status from wanderly-1. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await wanderlyFetch("/stripeConnect/create-account-link", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Stripe Connect failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const res = await wanderlyFetch("/stripeConnect/account-status", {
      method: "GET",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not load Stripe status" }, { status: 500 });
  }
}

/**
 * PATCH /api/partner/stripe/connect
 * Confirms Stripe Express onboarding is complete, writes stripeOnboardingComplete = true
 * to Dynamo, and refreshes the session cookie with the updated user record.
 */
export async function PATCH() {
  try {
    const res = await wanderlyFetch("/stripeConnect/confirm-onboarding", {
      method: "POST",
    });
    const data = await res.json().catch(() => ({})) as {
      status?: string;
      user?: Record<string, unknown>;
    };
    if (!res.ok || data.status !== "success") {
      return NextResponse.json(data, { status: res.status });
    }
    if (data.user) {
      const jar = await cookies();
      setPackPallyUserCookieOnly(jar, data.user);
    }
    return NextResponse.json({
      ...data,
      profile: data.user ? stripWanderlyUserSecrets(data.user) : undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not confirm onboarding" }, { status: 500 });
  }
}
