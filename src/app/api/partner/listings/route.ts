import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { requireMemberSession } from "@/lib/require-member-session";

export async function GET(req: Request) {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;

  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") || "40";
  const lastKey = searchParams.get("lastKey");
  const q = new URLSearchParams({
    userId: session.packUser.id,
    limit,
  });
  if (lastKey) q.set("lastKey", lastKey);

  try {
    const res = await wanderlyFetch(`/listings/by-user?${q.toString()}`, {
      method: "GET",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: res.status,
      headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "error", message: "List failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;

  try {
    const body = await req.json();
    const res = await wanderlyFetch("/listings/create", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "error", message: "Create failed" }, { status: 500 });
  }
}
