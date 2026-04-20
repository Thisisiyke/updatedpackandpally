"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Conversation, Message } from "@/types/messaging";
import {
  userConversations,
  partnerConversations,
  seedMessages,
  CURRENT_USER,
  CURRENT_PARTNER,
} from "@/data/conversations";

type Side = "user" | "partner";

const USER_CONV_KEY = "packpally_user_conversations";
const USER_MSG_KEY = "packpally_user_messages";
const PARTNER_CONV_KEY = "packpally_partner_conversations";
const PARTNER_MSG_KEY = "packpally_partner_messages";
const CHANGE_EVENT = "packpally_conversations_change";

function keysFor(side: Side) {
  return side === "user"
    ? { conv: USER_CONV_KEY, msg: USER_MSG_KEY }
    : { conv: PARTNER_CONV_KEY, msg: PARTNER_MSG_KEY };
}

function loadConversations(side: Side): Conversation[] {
  if (typeof window === "undefined") return [];
  const { conv } = keysFor(side);
  try {
    const raw = localStorage.getItem(conv);
    if (raw) return JSON.parse(raw);
  } catch {}
  return side === "user" ? userConversations : partnerConversations;
}

function loadMessages(side: Side): Record<string, Message[]> {
  if (typeof window === "undefined") return {};
  const { msg } = keysFor(side);
  try {
    const raw = localStorage.getItem(msg);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed from static data
  const seed: Record<string, Message[]> = {};
  const list = side === "user" ? userConversations : partnerConversations;
  list.forEach((c) => {
    seed[c.id] = seedMessages[c.id] || [];
  });
  return seed;
}

function saveConversations(side: Side, convs: Conversation[]) {
  const { conv } = keysFor(side);
  localStorage.setItem(conv, JSON.stringify(convs));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function saveMessages(side: Side, msgs: Record<string, Message[]>) {
  const { msg } = keysFor(side);
  localStorage.setItem(msg, JSON.stringify(msgs));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function useConversations(side: Side) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConversations(loadConversations(side));
    setMessages(loadMessages(side));
    setHydrated(true);

    const refresh = () => {
      setConversations(loadConversations(side));
      setMessages(loadMessages(side));
    };
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [side]);

  const currentId = side === "user" ? CURRENT_USER.id : CURRENT_PARTNER.id;

  const totalUnread = useMemo(
    () => conversations.reduce((s, c) => s + c.unreadCount, 0),
    [conversations]
  );

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const ta = new Date(a.lastMessageAt || 0).getTime();
      const tb = new Date(b.lastMessageAt || 0).getTime();
      return tb - ta;
    });
  }, [conversations]);

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations]
  );

  const getMessages = useCallback(
    (convId: string) => messages[convId] || [],
    [messages]
  );

  const sendMessage = useCallback(
    (convId: string, text: string) => {
      if (!text.trim()) return;
      const conv = loadConversations(side);
      const msgs = loadMessages(side);

      const newMsg: Message = {
        id: `m-${Date.now()}`,
        conversationId: convId,
        senderId: currentId,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        read: true,
      };

      msgs[convId] = [...(msgs[convId] || []), newMsg];
      saveMessages(side, msgs);

      const updated = conv.map((c) =>
        c.id === convId
          ? {
              ...c,
              lastMessage: `You: ${text.trim()}`,
              lastMessageAt: newMsg.createdAt,
              lastSenderId: currentId,
            }
          : c
      );
      saveConversations(side, updated);
      setConversations(updated);
      setMessages({ ...msgs });
    },
    [side, currentId]
  );

  const markRead = useCallback(
    (convId: string) => {
      const conv = loadConversations(side);
      const msgs = loadMessages(side);
      const target = conv.find((c) => c.id === convId);
      if (!target || target.unreadCount === 0) return;

      const updatedConv = conv.map((c) =>
        c.id === convId ? { ...c, unreadCount: 0 } : c
      );
      const updatedMsgs = {
        ...msgs,
        [convId]: (msgs[convId] || []).map((m) => ({ ...m, read: true })),
      };
      saveConversations(side, updatedConv);
      saveMessages(side, updatedMsgs);
      setConversations(updatedConv);
      setMessages(updatedMsgs);
    },
    [side]
  );

  return {
    hydrated,
    conversations: sortedConversations,
    totalUnread,
    getConversation,
    getMessages,
    sendMessage,
    markRead,
    currentId,
  };
}
