import { NextResponse } from "next/server";
import { getGoogleMapsServerKey } from "@/lib/google-maps-server";
import {
  parseAddressComponents,
  type ResolvedPlace,
} from "@/lib/resolved-place";

export async function GET(req: Request) {
  const key = getGoogleMapsServerKey();
  if (!key) {
    return NextResponse.json(
      { error: "Places is not configured (GOOGLE_MAPS_API_KEY)." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const placeId = (searchParams.get("placeId") || "").trim();
  if (!placeId) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 });
  }

  const lang = searchParams.get("language") || "en";
  const fields = [
    "place_id",
    "formatted_address",
    "geometry",
    "address_components",
  ].join(",");

  const q = new URLSearchParams({
    place_id: placeId,
    key,
    language: lang,
    fields,
  });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${q.toString()}`
    );
    const data = (await res.json()) as {
      status?: string;
      error_message?: string;
      result?: {
        place_id?: string;
        formatted_address?: string;
        geometry?: { location?: { lat: number; lng: number } };
        address_components?: Array<{
          long_name: string;
          short_name: string;
          types: string[];
        }>;
      };
    };

    if (data.status !== "OK" || !data.result) {
      console.warn("[places/details]", data.status, data.error_message);
      return NextResponse.json(
        { error: data.error_message || "Place not found" },
        { status: data.status === "NOT_FOUND" ? 404 : 502 }
      );
    }

    const r = data.result;
    const lat = r.geometry?.location?.lat;
    const lng = r.geometry?.location?.lng;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Missing coordinates for place" },
        { status: 502 }
      );
    }

    const parsed = parseAddressComponents(r.address_components);
    const place: ResolvedPlace = {
      placeId: r.place_id || placeId,
      formattedAddress: r.formatted_address || "",
      latitude: lat,
      longitude: lng,
      ...parsed,
    };

    return NextResponse.json({ place });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Place details failed" }, { status: 502 });
  }
}
