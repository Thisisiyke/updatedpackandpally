import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PP_USER_COOKIE } from "@/lib/wanderly-cookies";
import { wanderlyFetch, isWanderlyConfigured } from "@/lib/wanderly-server";
import type { PackPallyUser } from "@/types/packpally-user";
import type { Participant } from "@/types/messaging";
import {
  buildTravelerInbox,
  fetchGroupMeta,
  runPool,
  PLACEHOLDER,
  type ChatHistoryRow,
} from "@/lib/traveler-chat-server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isWanderlyConfigured()) {
    return NextResponse.json(
      { error: "Messaging backend is not configured", conversations: [] },
      { status: 503 }
    );
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

  const me: Participant = {
    id: user.id,
    name: user.name,
    avatar: user.image || PLACEHOLDER,
    role: "traveler",
  };

  try {
    const [historyRes, bookingsRes] = await Promise.all([
      wanderlyFetch(
        `/chat/chat_history?user_id=${encodeURIComponent(user.id)}`
      ),
      wanderlyFetch(
        `/chat/get-bookingsChat?userId=${encodeURIComponent(user.id)}`
      ),
    ]);

    if (!historyRes.ok) {
      const t = await historyRes.text().catch(() => "");
      console.warn("[me/messages/inbox] chat_history", historyRes.status, t.slice(0, 300));
    }
    if (!bookingsRes.ok) {
      const t = await bookingsRes.text().catch(() => "");
      console.warn("[me/messages/inbox] get-bookingsChat", bookingsRes.status, t.slice(0, 300));
    }

    const historyJson = (historyRes.ok
      ? await historyRes.json().catch(() => ({}))
      : {}) as { Data?: unknown[] };
    const directRows: ChatHistoryRow[] = Array.isArray(historyJson.Data)
      ? (historyJson.Data as ChatHistoryRow[])
      : [];

    const bookingsPayload = bookingsRes.ok
      ? await bookingsRes.json().catch(() => null)
      : null;
    // get-bookingsChat returns a JSON array (see wanderly-1 `res.json(uniqueTrips)`).
    const trips: { tripId: string; tripName: string; tripImg: string }[] = Array.isArray(
      bookingsPayload
    )
      ? (bookingsPayload as { tripId: string; tripName: string; tripImg: string }[])
      : [];

    const groupMeta = await runPool(trips, 5, (trip) => fetchGroupMeta(user.id, trip));

    const conversations = buildTravelerInbox(me, directRows, trips, groupMeta);

    return NextResponse.json({ conversations, meId: user.id });
  } catch (e) {
    console.error("[me/messages/inbox]", e);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 502 }
    );
  }
}
