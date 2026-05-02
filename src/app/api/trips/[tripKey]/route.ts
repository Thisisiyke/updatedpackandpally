import { NextResponse } from "next/server";
import { parseTripRouteParam } from "@/lib/trip-url";
import { wanderlyFetch } from "@/lib/wanderly-server";
import {
  wanderlyTripToUiTrip,
  type WanderlyTripRecord,
} from "@/lib/wanderly-trip-adapter";

async function fetchTripAuthed(tripId: string): Promise<WanderlyTripRecord | null> {
  const res = await wanderlyFetch(
    `/trips/getSingleTrip/${encodeURIComponent(tripId)}`,
    { withAuth: true }
  );
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    trip?: WanderlyTripRecord;
  };
  if (data.status === "success" && data.trip) return data.trip;
  return null;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ tripKey: string }> }
) {
  const { tripKey } = await ctx.params;
  const parsed = parseTripRouteParam(tripKey);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid trip" }, { status: 400 });
  }
  const { tripId, timestamp } = parsed;

  try {
    if (timestamp) {
      const res = await wanderlyFetch(
        `/trips/public-trip/${encodeURIComponent(tripId)}/${encodeURIComponent(timestamp)}`,
        { withAuth: false }
      );
      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        trip?: WanderlyTripRecord;
      };
      if (data.status === "success" && data.trip) {
        const trip = wanderlyTripToUiTrip(data.trip as WanderlyTripRecord);
        return NextResponse.json({ trip });
      }
    }

    const authedTrip = await fetchTripAuthed(tripId);
    if (authedTrip) {
      const trip = wanderlyTripToUiTrip(authedTrip);
      return NextResponse.json({ trip });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load trip" }, { status: 502 });
  }
}
