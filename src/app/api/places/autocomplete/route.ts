import { NextResponse } from "next/server";
import { getGoogleMapsServerKey } from "@/lib/google-maps-server";

export async function GET(req: Request) {
  const key = getGoogleMapsServerKey();
  if (!key) {
    return NextResponse.json(
      { error: "Places search is not configured (GOOGLE_MAPS_API_KEY)." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const input = (searchParams.get("input") || "").trim();
  if (input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }
  if (input.length > 200) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const lang = searchParams.get("language") || "en";
  // Match Wanderly mobile: no `types` filter so users can pick cities, areas, or points of interest.
  const q = new URLSearchParams({
    input,
    key,
    language: lang,
  });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${q.toString()}`
    );
    const data = (await res.json()) as {
      predictions?: Array<{ place_id: string; description: string }>;
      status?: string;
      error_message?: string;
    };

    if (data.status === "REQUEST_DENIED" || data.status === "INVALID_REQUEST") {
      console.warn("[places/autocomplete]", data.status, data.error_message);
      return NextResponse.json(
        { error: data.error_message || "Places request failed" },
        { status: 502 }
      );
    }

    const predictions = (data.predictions || []).map((p) => ({
      placeId: p.place_id,
      description: p.description,
    }));

    return NextResponse.json({ predictions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Autocomplete failed" }, { status: 502 });
  }
}
