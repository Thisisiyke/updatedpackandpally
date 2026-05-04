import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await wanderlyFetch("/tripBookings/update-installment-dates", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { status: "failed", message: "Could not update installment dates" },
      { status: 500 }
    );
  }
}
