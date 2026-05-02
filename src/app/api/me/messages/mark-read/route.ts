import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PP_USER_COOKIE } from "@/lib/wanderly-cookies";
import { wanderlyFetch, isWanderlyConfigured } from "@/lib/wanderly-server";
import type { PackPallyUser } from "@/types/packpally-user";

export const dynamic = "force-dynamic";

/**
 * Parity with mobile: mark DM or trip group as read (Wanderly DynamoDB + TripChatReads).
 */
export async function POST(req: Request) {
  if (!isWanderlyConfigured()) {
    return NextResponse.json({ error: "Messaging backend is not configured" }, { status: 503 });
  }

  const jar = await cookies();
  const raw = jar.get(PP_USER_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let user: PackPallyUser;
  try {
    user = JSON.parse(raw) as PackPallyUser;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user?.id || user.role === "guest") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { kind: "direct"; peerId: string } | { kind: "group"; tripId: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.kind === "direct" && body.peerId) {
      // Marks messages the peer sent to me (sender_id = peer, receiver_id = me)
      const res = await wanderlyFetch("/chat/mark-readss", {
        method: "POST",
        body: JSON.stringify({
          sender_id: body.peerId,
          receiver_id: user.id,
        }),
      });
      if (!res.ok) {
        return NextResponse.json({ ok: false }, { status: 200 });
      }
      return NextResponse.json({ ok: true });
    }
    if (body.kind === "group" && body.tripId) {
      const res = await wanderlyFetch("/chat/reset-unread", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          tripId: body.tripId,
        }),
      });
      if (!res.ok) {
        return NextResponse.json({ ok: false }, { status: 200 });
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  } catch (e) {
    console.error("[me/messages/mark-read]", e);
    return NextResponse.json({ ok: false });
  }
}
