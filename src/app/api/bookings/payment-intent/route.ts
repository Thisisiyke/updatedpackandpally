import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, amount, currency, tripId, tripTimestamp, userId, paymentMode } = body;
    if (!email || !name || amount == null) {
      return NextResponse.json({ error: "email, name, amount required" }, { status: 400 });
    }
    if (!tripId || tripTimestamp == null || tripTimestamp === "") {
      return NextResponse.json(
        { error: "tripId and tripTimestamp required for host payouts" },
        { status: 400 }
      );
    }
    const res = await wanderlyFetch("/tripBookings/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({
        email,
        name,
        amount,
        currency: currency || "usd",
        tripId,
        tripTimestamp,
        userId: userId || "",
        paymentMode: paymentMode || "full",
      }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Payment intent failed" }, { status: 500 });
  }
}
