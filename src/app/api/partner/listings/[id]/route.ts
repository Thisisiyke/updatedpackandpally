import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { requireMemberSession } from "@/lib/require-member-session";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ status: "error", message: "Missing id" }, { status: 400 });
  }

  try {
    const res = await wanderlyFetch(`/listings/get/${encodeURIComponent(id)}`, {
      method: "GET",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "error", message: "Load failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ status: "error", message: "Missing id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const res = await wanderlyFetch(`/listings/update/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "error", message: "Save failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ status: "error", message: "Missing id" }, { status: 400 });
  }

  try {
    const res = await wanderlyFetch(`/listings/delete/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "error", message: "Delete failed" }, { status: 500 });
  }
}
