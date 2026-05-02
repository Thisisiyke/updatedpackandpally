"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import type { Conversation, Message } from "@/types/messaging";
import { parseConversationRouteId } from "@/lib/traveler-chat-ids";

/**
 * Inbox and threads from the Wanderly API — same as the React Native app for any logged-in user
 * (traveler or host): `/chat/chat_history` + `/chat/get-bookingsChat` for the list;
 * `/chat/messages` and `/chat/groupChats/:tripId` for thread bodies. Session `user.id` is the
 * `user_id` / participant id in those APIs.
 */
export type TravelerInboxApi = ReturnType<typeof useTravelerMessagesApi>;

export function useTravelerMessagesApi(enabled: boolean) {
  const { user } = usePackPallyAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesById, setMessagesById] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(() => enabled);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setConversations([]);
      setMessagesById({});
      setError(null);
    }
  }, [enabled]);

  const meId = user?.id ?? "";

  const loadInbox = useCallback(async () => {
    if (!enabled || !user?.id || user.role === "guest") {
      setConversations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/me/messages/inbox", { credentials: "include" });
      if (res.status === 503) {
        setConversations([]);
        return;
      }
      if (!res.ok) {
        setError("Could not load conversations");
        setConversations([]);
        return;
      }
      const data = (await res.json()) as { conversations?: Conversation[] };
      setConversations(data.conversations || []);
    } catch {
      setError("Could not load conversations");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, user?.id, user?.role]);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  const loadThread = useCallback(
    async (convId: string) => {
      if (!enabled) {
        return;
      }
      const parsed = parseConversationRouteId(convId);
      if (!parsed || !meId) {
        return;
      }
      setThreadLoading(true);
      try {
        const url =
          parsed.kind === "direct"
            ? `/api/me/messages/thread?kind=direct&peerId=${encodeURIComponent(parsed.peerId)}`
            : `/api/me/messages/thread?kind=group&tripId=${encodeURIComponent(parsed.tripId)}`;
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { messages?: Message[] };
        setMessagesById((prev) => ({ ...prev, [convId]: data.messages || [] }));
      } finally {
        setThreadLoading(false);
      }
    },
    [enabled, meId]
  );

  const getMessages = useCallback(
    (id: string) => messagesById[id] || [],
    [messagesById]
  );

  const sendMessage = useCallback(
    async (convId: string, text: string) => {
      if (!enabled) {
        return;
      }
      const parsed = parseConversationRouteId(convId);
      if (!parsed || !text.trim() || !meId) {
        return;
      }
      const tripMeta = conversations.find((c) => c.id === convId);
      const res = await fetch("/api/me/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          parsed.kind === "direct"
            ? { kind: "direct", receiverId: parsed.peerId, text: text.trim() }
            : {
                kind: "group",
                tripId: parsed.tripId,
                tripName: tripMeta?.tripTitle || tripMeta?.groupName || "",
                text: text.trim(),
              }
        ),
      });
      if (!res.ok) {
        return;
      }
      const newMsg: Message = {
        id: `local-${Date.now()}`,
        conversationId: convId,
        senderId: meId,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        read: true,
      };
      setMessagesById((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), newMsg],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                lastMessage: `You: ${text.trim()}`,
                lastMessageAt: newMsg.createdAt,
              }
            : c
        )
      );
    },
    [conversations, enabled, meId]
  );

  const totalUnread = useMemo(
    () => conversations.reduce((s, c) => s + (c.unreadCount || 0), 0),
    [conversations]
  );

  const markRead = useCallback(
    async (convId: string) => {
      if (!enabled) {
        return;
      }
      const parsed = parseConversationRouteId(convId);
      if (!parsed) {
        return;
      }
      const target = conversations.find((c) => c.id === convId);
      if (target && target.unreadCount === 0) {
        return;
      }
      void fetch("/api/me/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          parsed.kind === "direct"
            ? { kind: "direct", peerId: parsed.peerId }
            : { kind: "group", tripId: parsed.tripId }
        ),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );
    },
    [conversations, enabled]
  );

  return {
    conversations,
    getMessages,
    sendMessage,
    markRead,
    meId: enabled ? meId : "",
    /** Initial inbox load finished (may be empty). */
    hydrated: !enabled || !loading,
    threadLoading,
    error,
    reloadInbox: loadInbox,
    loadThread,
    totalUnread,
  };
}
