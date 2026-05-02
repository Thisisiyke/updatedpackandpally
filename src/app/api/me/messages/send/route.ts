import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PP_USER_COOKIE } from "@/lib/wanderly-cookies";
import { wanderlyFetch, isWanderlyConfigured } from "@/lib/wanderly-server";
import type { PackPallyUser } from "@/types/packpally-user";

export const dynamic = "force-dynamic";

type DirectBody = {
  kind: "direct";
  receiverId: string;
  text: string;
};

type GroupBody = {
  kind: "group";
  tripId: string;
  tripName?: string;
  text: string;
};

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

  let body: DirectBody | GroupBody;
  try {
    body = (await req.json()) as DirectBody | GroupBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    if (body.kind === "direct") {
      if (!body.receiverId) {
        return NextResponse.json({ error: "receiverId is required" }, { status: 400 });
      }
      const res = await wanderlyFetch("/chat/send-direct", {
        method: "POST",
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: body.receiverId,
          message: text,
        }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.warn("[send] direct", res.status, t.slice(0, 200));
        return NextResponse.json({ error: "Failed to send" }, { status: 502 });
      }
      return NextResponse.json({ ok: true });
    }

    if (body.kind === "group") {
      if (!body.tripId) {
        return NextResponse.json({ error: "tripId is required" }, { status: 400 });
      }
      const res = await wanderlyFetch("/chat/send-group", {
        method: "POST",
        body: JSON.stringify({
          tripId: body.tripId,
          message: text,
          sender_id: user.id,
          senderName: user.name,
          tripName: body.tripName ?? "",
          userImage: user.image ?? "",
          senderIds: null,
        }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.warn("[send] group", res.status, t.slice(0, 200));
        return NextResponse.json({ error: "Failed to send" }, { status: 502 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  } catch (e) {
    console.error("[me/messages/send]", e);
    return NextResponse.json({ error: "Failed to send" }, { status: 502 });
  }
}
