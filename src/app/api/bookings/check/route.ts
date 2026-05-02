import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");
  const timestamp = searchParams.get("timestamp");
  if (!tripId || !timestamp) {
    return NextResponse.json({ error: "tripId and timestamp required" }, { status: 400 });
  }
  const res = await wanderlyFetch(
    `/tripBookings/checkAvailability?tripId=${encodeURIComponent(tripId)}&timestamp=${encodeURIComponent(timestamp)}`,
    { method: "GET" }
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
