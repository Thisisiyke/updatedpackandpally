import { NextResponse } from "next/server";

/** Reserved for future Amadeus/Duffel/etc. BFF routes. Returns 501 until configured. */
export async function GET() {
  return NextResponse.json(
    { error: "Hotel/flight provider not configured" },
    { status: 501 }
  );
}
