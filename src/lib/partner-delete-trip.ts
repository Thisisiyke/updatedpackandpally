/**
 * Delete a hosted trip (Wanderly + S3 cleanup on the API). `tripRouteId` is the
 * same value as `PartnerTrip.id` / `/partner/trips/[id]` (encoded `tripId__timestamp`).
 */
export async function deletePartnerTrip(
  tripRouteId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(
    `/api/partner/trips/${encodeURIComponent(tripRouteId)}`,
    { method: "DELETE", credentials: "include" }
  );
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    return {
      ok: false,
      error: data.error || "Could not delete trip",
    };
  }
  return { ok: true };
}
