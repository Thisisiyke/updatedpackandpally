import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";
import {
  wanderlyTripToUiTrip,
  type WanderlyTripRecord,
} from "@/lib/wanderly-trip-adapter";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") || "50";
  const tripTypes = searchParams.getAll("tripType").filter(Boolean);

  try {
    const q = new URLSearchParams({ limit });
    for (const t of tripTypes) {
      q.append("tripType", t);
    }
    const res = await wanderlyFetch(`/trips/get-alltrips?${q.toString()}`, {
      withAuth: false,
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: t || "Upstream error" }, { status: res.status });
    }
    const data = await res.json();
    const items = (data.items || []) as WanderlyTripRecord[];
    const trips = items.map((row) => wanderlyTripToUiTrip(row));
    return NextResponse.json({ trips, lastKey: data.lastKey });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load trips. Is WANDERLY_API_BASE_URL set and wanderly-1 running?" },
      { status: 502 }
    );
  }
}
