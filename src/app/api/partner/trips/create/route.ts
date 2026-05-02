import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { WANDERLY_ACCESS_COOKIE } from "@/lib/wanderly-cookies";

export async function POST(req: Request) {
  const token = (await cookies()).get(WANDERLY_ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { status: "failed", message: "Sign in again to create a trip." },
      { status: 401 }
    );
  }
  const formData = await req.formData();
  const res = await wanderlyFetch("/trips/create-trip", {
    method: "POST",
    body: formData,
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    data = {
      status: "failed",
      message: text?.slice(0, 400) || "Unexpected response from trip service",
    };
  }
  return NextResponse.json(data, { status: res.status });
}
