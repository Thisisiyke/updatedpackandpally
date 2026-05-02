import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");
  const status = searchParams.get("status");
  if (!tripId) {
    return NextResponse.json({ error: "tripId required" }, { status: 400 });
  }
  const q = new URLSearchParams({ tripId, limit: searchParams.get("limit") || "50" });
  if (status) q.set("status", status);
  const lastKey = searchParams.get("lastKey");
  if (lastKey) q.set("lastKey", lastKey);

  const res = await wanderlyFetch(`/tripBookings/getBookingsByTripId?${q.toString()}`, {
    method: "GET",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
