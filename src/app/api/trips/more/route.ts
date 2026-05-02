import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";
import {
  wanderlyTripToUiTrip,
  type WanderlyTripRecord,
} from "@/lib/wanderly-trip-adapter";

/**
 * Proxies wanderly-1 GET /trips/moreTrips?country= — requires auth (verifyToken upstream).
 * Matches mobile fallback when the main feed is empty or to show country-related trips.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country")?.trim();
  if (!country) {
    return NextResponse.json({ error: "country is required" }, { status: 400 });
  }

  try {
    const res = await wanderlyFetch(
      `/trips/moreTrips?country=${encodeURIComponent(country)}`,
      { withAuth: true }
    );

    if (res.status === 401) {
      return NextResponse.json({ trips: [], needsAuth: true });
    }

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json(
        { error: t || "Upstream error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const items = (data.moreTrips || []) as WanderlyTripRecord[];
    const trips = items.map((row) => wanderlyTripToUiTrip(row));
    return NextResponse.json({ trips });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load country trips" },
      { status: 502 }
    );
  }
}
