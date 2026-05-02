import "server-only";

/**
 * Server-only key for Places REST (Geocoding / Place Autocomplete / Details).
 * Restrict in GCP: IP (server) or referer as appropriate.
 */
export function getGoogleMapsServerKey(): string {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    "";
  return key.trim();
}
