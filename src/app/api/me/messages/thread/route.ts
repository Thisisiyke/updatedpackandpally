import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PP_USER_COOKIE } from "@/lib/wanderly-cookies";
import { wanderlyFetch, isWanderlyConfigured } from "@/lib/wanderly-server";
import type { PackPallyUser } from "@/types/packpally-user";
import {
  dmConversationId,
  groupConversationId,
} from "@/lib/traveler-chat-ids";
import {
  mapDirectApiMessage,
  mapGroupApiMessage,
} from "@/lib/traveler-chat-server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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

  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");
  const peerId = searchParams.get("peerId");
  const tripId = searchParams.get("tripId");

  try {
    if (kind === "direct" && peerId) {
      const q = new URLSearchParams({
        sender_id: user.id,
        receiver_id: peerId,
        limit: "150",
      });
      const res = await wanderlyFetch(`/chat/messages?${q.toString()}`);
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.warn("[thread] messages", res.status, t.slice(0, 200));
        return NextResponse.json({ error: "Failed to load chat" }, { status: 502 });
      }
      const data = (await res.json()) as { chat?: Record<string, unknown>[] };
      const convId = dmConversationId(peerId);
      const messages = (data.chat || []).map((m) =>
        mapDirectApiMessage(m, convId)
      );
      return NextResponse.json({ messages, conversationId: convId });
    }

    if (kind === "group" && tripId) {
      const res = await wanderlyFetch(
        `/chat/groupChats/${encodeURIComponent(tripId)}?limit=100`
      );
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.warn("[thread] groupChats", res.status, t.slice(0, 200));
        return NextResponse.json({ error: "Failed to load chat" }, { status: 502 });
      }
      const data = (await res.json()) as {
        messages?: Record<string, unknown>[];
      };
      const convId = groupConversationId(tripId);
      const messages = (data.messages || []).map((m) =>
        mapGroupApiMessage(m, convId)
      );
      return NextResponse.json({ messages, conversationId: convId });
    }

    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  } catch (e) {
    console.error("[me/messages/thread]", e);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 502 });
  }
}
