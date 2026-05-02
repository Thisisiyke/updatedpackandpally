import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { requireMemberSession } from "@/lib/require-member-session";

/** Opens Stripe Express Dashboard for bank / tax — wanderly `POST /stripeConnect/create-login-link`. */
export async function POST() {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;

  try {
    const res = await wanderlyFetch("/stripeConnect/create-login-link", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "error", message: "Stripe login failed" }, { status: 500 });
  }
}
