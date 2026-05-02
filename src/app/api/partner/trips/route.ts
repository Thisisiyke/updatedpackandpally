import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const q = new URLSearchParams({ userId, limit: searchParams.get("limit") || "50" });
  const status = searchParams.get("status");
  if (status) q.set("status", status);
  const lastKey = searchParams.get("lastKey");
  if (lastKey) q.set("lastKey", lastKey);

  const res = await wanderlyFetch(`/trips/get-tripsWithStatus?${q.toString()}`, {
    method: "GET",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
