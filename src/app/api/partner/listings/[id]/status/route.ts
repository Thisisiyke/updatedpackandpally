import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { requireMemberSession } from "@/lib/require-member-session";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ status: "error", message: "Missing id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const res = await wanderlyFetch(`/listings/status/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "error", message: "Status update failed" }, { status: 500 });
  }
}
