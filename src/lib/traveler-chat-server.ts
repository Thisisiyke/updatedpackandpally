import "server-only";

import type { Conversation, Message, Participant } from "@/types/messaging";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { dmConversationId, groupConversationId } from "@/lib/traveler-chat-ids";

const PLACEHOLDER = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export type ChatHistoryRow = {
  user_id: string;
  user_name: string;
  user_image_url: string;
  latest_message: string;
  latest_time: string;
  latest_read?: string;
};

type BookingsChatTrip = {
  tripId: string;
  tripName: string;
  tripImg: string;
};

export async function runPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const n = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    })
  );
  return results;
}

function parseUtcSqlTime(s: string): string {
  const t = s?.trim();
  if (!t) return new Date().toISOString();
  const iso = t.includes("T") ? t : `${t.replace(" ", "T")}Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

type GroupMeta = {
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export async function fetchGroupMeta(
  userId: string,
  trip: BookingsChatTrip
): Promise<GroupMeta> {
  const [msgRes, unreadRes] = await Promise.all([
    wanderlyFetch(`/chat/groupChats/${encodeURIComponent(trip.tripId)}?limit=1`),
    wanderlyFetch(
      `/chat/unread-trip-count?userId=${encodeURIComponent(userId)}&tripId=${encodeURIComponent(
        trip.tripId
      )}`
    ),
  ]);

  let lastMessage = "";
  let lastMessageAt = new Date(0).toISOString();
  if (msgRes.ok) {
    const data = (await msgRes.json().catch(() => ({}))) as {
      messages?: Array<{ message?: string; timestamp?: string }>;
    };
    const list = data.messages;
    if (list?.length) {
      const last = list[list.length - 1];
      lastMessage = (last?.message as string) || "";
      if (last?.timestamp) {
        const d = new Date(last.timestamp);
        if (!Number.isNaN(d.getTime())) lastMessageAt = d.toISOString();
      }
    }
  }
  if (!lastMessage) {
    lastMessage = "No messages yet";
    lastMessageAt = new Date().toISOString();
  }

  let unreadCount = 0;
  if (unreadRes.ok) {
    const u = (await unreadRes.json().catch(() => ({}))) as { unreadCount?: number };
    unreadCount = typeof u.unreadCount === "number" ? u.unreadCount : 0;
  }

  return { lastMessage, lastMessageAt, unreadCount };
}

export function buildTravelerInbox(
  me: Participant,
  directRows: ChatHistoryRow[],
  groupTrips: BookingsChatTrip[],
  groupMeta: GroupMeta[]
): Conversation[] {
  const direct: Conversation[] = directRows.map((row) => {
    const other: Participant = {
      id: row.user_id,
      name: row.user_name || "User",
      avatar: row.user_image_url || PLACEHOLDER,
      role: "host",
    };
    return {
      id: dmConversationId(row.user_id),
      participants: [me, other],
      lastMessage: row.latest_message || "",
      lastMessageAt: parseUtcSqlTime(row.latest_time),
      unreadCount: 0,
      isGroup: false,
    };
  });

  const groups: Conversation[] = groupTrips.map((trip, i) => {
    const meta = groupMeta[i] ?? {
      lastMessage: "No messages yet",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };
    const placeholderPeer: Participant = {
      id: `group-member-${trip.tripId}`,
      name: "Travelers & host",
      avatar: trip.tripImg || PLACEHOLDER,
      role: "host",
    };
    return {
      id: groupConversationId(trip.tripId),
      isGroup: true,
      groupName: trip.tripName || "Group chat",
      groupImage: trip.tripImg,
      tripId: trip.tripId,
      tripTitle: trip.tripName,
      tripImage: trip.tripImg,
      participants: [me, placeholderPeer],
      lastMessage: meta.lastMessage,
      lastMessageAt: meta.lastMessageAt,
      unreadCount: meta.unreadCount,
      createdBy: me.id,
    };
  });

  return [...direct, ...groups].sort(
    (a, b) =>
      new Date(b.lastMessageAt || 0).getTime() -
      new Date(a.lastMessageAt || 0).getTime()
  );
}

/**
 * Map Wanderly /chat/messages or /chat/groupChats item → Message
 */
export function mapDirectApiMessage(
  m: Record<string, unknown>,
  conversationId: string
): Message {
  const id = String(m._id ?? m.message_id ?? `msg-${Math.random()}`);
  const readRaw = m.read;
  const read = readRaw === "true" || readRaw === true;
  const ts = m.timestamp ? String(m.timestamp) : m.time ? String(m.time) : new Date().toISOString();
  const created = new Date(ts);
  return {
    id,
    conversationId,
    senderId: String(m.sender_id ?? ""),
    text: String(m.message ?? ""),
    createdAt: Number.isNaN(created.getTime()) ? new Date().toISOString() : created.toISOString(),
    read,
  };
}

export function mapGroupApiMessage(
  m: Record<string, unknown>,
  conversationId: string
): Message {
  const id = String(m._id ?? `gmsg-${Math.random()}`);
  const ts = m.timestamp ? String(m.timestamp) : new Date().toISOString();
  const created = new Date(ts);
  return {
    id,
    conversationId,
    senderId: String(m.sender_id ?? ""),
    text: String(m.message ?? ""),
    createdAt: Number.isNaN(created.getTime()) ? new Date().toISOString() : created.toISOString(),
    read: true,
  };
}

export { PLACEHOLDER };
