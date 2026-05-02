/** Composite trip key for URLs: `${tripId}__${timestamp}` (timestamp from Dynamo sort key). */
export function encodeTripRouteKey(tripId: string, timestamp: string): string {
  return encodeURIComponent(`${tripId}__${timestamp}`);
}

export function decodeTripRouteKey(
  encoded: string
): { tripId: string; timestamp: string } | null {
  try {
    const raw = decodeURIComponent(encoded);
    const idx = raw.lastIndexOf("__");
    if (idx <= 0) return null;
    const tripId = raw.slice(0, idx);
    const timestamp = raw.slice(idx + 2);
    if (!tripId || !timestamp) return null;
    return { tripId, timestamp };
  } catch {
    return null;
  }
}

/**
 * Parse `/trips/[segment]` (and API) after Next.js decodes the path segment.
 * Timestamp may be missing on some booking rows — then callers should use an authed trip fetch by id.
 */
export function parseTripRouteParam(segment: string): {
  tripId: string;
  timestamp: string | null;
} | null {
  try {
    const raw = decodeURIComponent(segment);
    if (!raw.trim()) return null;
    const idx = raw.lastIndexOf("__");
    if (idx > 0) {
      const tripId = raw.slice(0, idx);
      const ts = raw.slice(idx + 2).trim();
      if (tripId) return { tripId, timestamp: ts || null };
    }
    return { tripId: raw, timestamp: null };
  } catch {
    return null;
  }
}

/** DynamoDB partition key for `Wan-trips` from a route param (composite or legacy id). */
export function dynamoTripIdFromRouteParam(param: string): string {
  const dec = decodeTripRouteKey(param);
  if (dec) return dec.tripId;
  try {
    const raw = decodeURIComponent(param);
    const idx = raw.lastIndexOf("__");
    if (idx > 0) return raw.slice(0, idx);
    return raw;
  } catch {
    return param;
  }
}
