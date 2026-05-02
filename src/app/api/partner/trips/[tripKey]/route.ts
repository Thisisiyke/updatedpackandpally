import { NextResponse } from "next/server";
import { requireMemberSession } from "@/lib/require-member-session";
import { parseTripRouteParam } from "@/lib/trip-url";
import { wanderlyFetch } from "@/lib/wanderly-server";
import type { WanderlyTripRecord } from "@/lib/wanderly-trip-adapter";

async function fetchTripAuthed(
  tripId: string
): Promise<WanderlyTripRecord | null> {
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

/**
 * Deletes a hosted trip via Wanderly `DELETE /trips/tripDelete/:id`.
 * The backend removes DynamoDB row and deletes associated S3 objects (CloudFront + S3 URLs).
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ tripKey: string }> }
) {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;

  const { tripKey } = await ctx.params;
  const parsed = parseTripRouteParam(tripKey);
  if (!parsed?.tripId) {
    return NextResponse.json({ error: "Invalid trip" }, { status: 400 });
  }

  const { tripId } = parsed;
  const trip = await fetchTripAuthed(tripId);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const ownerId = String(trip.userId ?? "").trim();
  if (!ownerId || ownerId !== String(session.packUser.id).trim()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const res = await wanderlyFetch(
    `/trips/tripDelete/${encodeURIComponent(tripId)}`,
    { method: "DELETE" }
  );
  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    return NextResponse.json(
      {
        error:
          data.error ||
          (typeof data.message === "string" ? data.message : null) ||
          "Delete failed",
      },
      { status: res.status >= 400 ? res.status : 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    status: data.status,
    message: data.message,
  });
}
