import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";

async function fetchAllHostTrips(userId: string): Promise<unknown[]> {
  const items: unknown[] = [];
  let lastKey: string | null = null;
  for (let page = 0; page < 10; page += 1) {
    const q = new URLSearchParams({ userId, limit: "25" });
    if (lastKey) q.set("lastKey", lastKey);
    const res = await wanderlyFetch(`/trips/get-tripsWithStatus?${q.toString()}`, {
      method: "GET",
    });
    const data = (await res.json().catch(() => ({}))) as {
      items?: unknown[];
      lastKey?: string | null;
    };
    if (Array.isArray(data.items)) items.push(...data.items);
    lastKey = data.lastKey ?? null;
    if (!lastKey) break;
  }
  return items;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const trips = await fetchAllHostTrips(userId);
    const bookings: unknown[] = [];
    for (const trip of trips) {
      const t = trip as { _id?: string };
      const tid = t._id;
      if (!tid) continue;
      const res = await wanderlyFetch(
        `/tripBookings/getBookingsByTripId?${new URLSearchParams({
          tripId: String(tid),
          limit: "50",
        }).toString()}`,
        { method: "GET" }
      );
      const data = (await res.json().catch(() => ({}))) as { bookings?: unknown[] };
      if (Array.isArray(data.bookings)) bookings.push(...data.bookings);
    }
    return NextResponse.json({ bookings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "aggregate failed" }, { status: 500 });
  }
}
