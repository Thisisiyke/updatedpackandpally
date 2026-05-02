import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { requireMemberSession } from "@/lib/require-member-session";

/**
 * Single round-trip host dashboard stats from wanderly-1 (Dynamo indexes only — fast).
 */
export async function GET() {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;

  try {
    const res = await wanderlyFetch("/trips/getAdminDashboardStats", {
      method: "POST",
      body: JSON.stringify({ adminId: session.packUser.id }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        "Cache-Control": "private, max-age=15, stale-while-revalidate=45",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "error", message: "Overview failed" }, { status: 500 });
  }
}
