import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { requireMemberSession } from "@/lib/require-member-session";

/** Stripe Connect Express payouts + balance for the signed-in partner (proxied from wanderly). */
export async function GET(req: Request) {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;

  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") || "40";
  const q = new URLSearchParams({ limit });

  try {
    const res = await wanderlyFetch(`/stripeConnect/payouts?${q.toString()}`, {
      method: "GET",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "error", message: "Payouts failed" }, { status: 500 });
  }
}
