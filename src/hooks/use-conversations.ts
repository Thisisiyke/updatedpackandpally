"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Conversation, Message, Participant } from "@/types/messaging";
import {
  userConversations,
  partnerConversations,
  seedMessages,
  CURRENT_USER,
  CURRENT_PARTNER,
} from "@/data/conversations";
import type { Trip, Host } from "@/types";

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

  const createGroup = useCallback(
    (
      groupName: string,
      invited: Participant[],
      options?: { tripTitle?: string; tripImage?: string; groupImage?: string }
    ) => {
      if (!groupName.trim() || invited.length === 0) return null;

      const me = side === "user" ? CURRENT_USER : CURRENT_PARTNER;
      const allParticipants: Participant[] = [
        me,
        ...invited.filter((p) => p.id !== me.id),
      ];

      const newConv: Conversation = {
        id: `c-group-${Date.now()}`,
        isGroup: true,
        groupName: groupName.trim(),
        groupImage: options?.groupImage || options?.tripImage,
        participants: allParticipants,
        tripTitle: options?.tripTitle,
        tripImage: options?.tripImage,
        lastMessage: "You created this group",
        lastMessageAt: new Date().toISOString(),
        lastSenderId: me.id,
        unreadCount: 0,
        createdBy: me.id,
      };

      const conv = loadConversations(side);
      const msgs = loadMessages(side);

      const systemMsg: Message = {
        id: `m-${Date.now()}`,
        conversationId: newConv.id,
        senderId: me.id,
        text: `Created group "${newConv.groupName}" with ${
          invited.length
        } ${invited.length === 1 ? "member" : "members"}.`,
        createdAt: new Date().toISOString(),
        read: true,
      };

      const updatedConv = [newConv, ...conv];
      const updatedMsgs = { ...msgs, [newConv.id]: [systemMsg] };

      saveConversations(side, updatedConv);
      saveMessages(side, updatedMsgs);
      setConversations(updatedConv);
      setMessages(updatedMsgs);

      return newConv;
    },
    [side]
  );

  const leaveGroup = useCallback(
    (convId: string) => {
      const conv = loadConversations(side);
      const target = conv.find((c) => c.id === convId);
      if (!target || !target.isGroup) return;

      const updatedConv = conv.filter((c) => c.id !== convId);
      saveConversations(side, updatedConv);
      setConversations(updatedConv);
      // We keep messages in storage but they become orphaned for this side
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
    createGroup,
    leaveGroup,
    currentId,
  };
}

/**
 * Auto-add the current user to the trip's group chat after a successful booking.
 * If a group already exists for the trip (matched by tripId or tripTitle), the
 * user is added as a participant and a system message is posted. If no group
 * exists yet, one is created with the current user and (if provided) the host
 * as initial participants.
 *
 * Idempotent: calling this multiple times for the same user+trip is a no-op
 * after the first success.
 *
 * Returns the conversation id, or null if called on the server.
 */
export function joinTripGroupChat(
  trip: Pick<Trip, "id" | "title" | "coverImage">,
  host?: Pick<Host, "id" | "name" | "avatar">
): string | null {
  if (typeof window === "undefined") return null;

  const side: Side = "user";
  const conversations = loadConversations(side);
  const messages = loadMessages(side);
  const now = new Date().toISOString();

  const existing = conversations.find(
    (c) =>
      c.isGroup &&
      (c.tripId === trip.id ||
        (!!c.tripTitle && c.tripTitle === trip.title))
  );

  if (existing) {
    const alreadyIn = existing.participants.some(
      (p) => p.id === CURRENT_USER.id
    );
    if (alreadyIn) return existing.id;

    const systemMsg: Message = {
      id: `m-join-${Date.now()}`,
      conversationId: existing.id,
      senderId: CURRENT_USER.id,
      text: `${CURRENT_USER.name} joined the trip`,
      createdAt: now,
      read: true,
    };

    const updatedConv: Conversation = {
      ...existing,
      participants: [...existing.participants, CURRENT_USER],
      tripId: existing.tripId || trip.id,
      lastMessage: systemMsg.text,
      lastMessageAt: now,
      lastSenderId: CURRENT_USER.id,
    };

    const nextConversations = conversations.map((c) =>
      c.id === existing.id ? updatedConv : c
    );
    const nextMessages = {
      ...messages,
      [existing.id]: [...(messages[existing.id] || []), systemMsg],
    };

    saveConversations(side, nextConversations);
    saveMessages(side, nextMessages);
    return existing.id;
  }

  // No group yet for this trip — create one
  const hostParticipant: Participant | null = host
    ? {
        id: `h-${host.id}`,
        name: host.name,
        avatar: host.avatar,
        role: "host",
      }
    : null;

  const participants: Participant[] = hostParticipant
    ? [CURRENT_USER, hostParticipant]
    : [CURRENT_USER];

  const newId = `c-group-${trip.id}-${Date.now()}`;
  const newConv: Conversation = {
    id: newId,
    isGroup: true,
    groupName: trip.title,
    groupImage: trip.coverImage,
    participants,
    tripId: trip.id,
    tripTitle: trip.title,
    tripImage: trip.coverImage,
    lastMessage: `${CURRENT_USER.name} joined the trip`,
    lastMessageAt: now,
    lastSenderId: CURRENT_USER.id,
    unreadCount: 0,
    createdBy: CURRENT_USER.id,
  };

  const systemMsg: Message = {
    id: `m-create-${Date.now()}`,
    conversationId: newId,
    senderId: CURRENT_USER.id,
    text: `Welcome to the group chat for ${trip.title}.`,
    createdAt: now,
    read: true,
  };

  saveConversations(side, [newConv, ...conversations]);
  saveMessages(side, { ...messages, [newId]: [systemMsg] });
  return newId;
}

/**
 * Map-feature counterpart to joinTripGroupChat. When a user joins an activity
 * pinned on the mobile map, add them to the activity's group chat (creating
 * the chat on first join).
 *
 * Idempotent — returns the conversation id either way.
 */
export function joinActivityGroupChat(
  activity: {
    id: string;
    title: string;
    locationLabel: string;
    emoji?: string;
    image?: string;
    conversationId?: string;
  },
  creator: Participant
): string | null {
  if (typeof window === "undefined") return null;

  const side: Side = "user";
  const conversations = loadConversations(side);
  const messages = loadMessages(side);
  const now = new Date().toISOString();

  const existing = activity.conversationId
    ? conversations.find((c) => c.id === activity.conversationId)
    : conversations.find((c) => c.isGroup && c.id === `c-activity-${activity.id}`);

  if (existing) {
    const alreadyIn = existing.participants.some(
      (p) => p.id === CURRENT_USER.id
    );
    if (alreadyIn) return existing.id;

    const joinMsg: Message = {
      id: `m-join-${Date.now()}`,
      conversationId: existing.id,
      senderId: CURRENT_USER.id,
      text: `${CURRENT_USER.name} joined the activity`,
      createdAt: now,
      read: true,
    };

    const updatedConv: Conversation = {
      ...existing,
      participants: [...existing.participants, CURRENT_USER],
      lastMessage: joinMsg.text,
      lastMessageAt: now,
      lastSenderId: CURRENT_USER.id,
    };

    const nextConversations = conversations.map((c) =>
      c.id === existing.id ? updatedConv : c
    );
    const nextMessages = {
      ...messages,
      [existing.id]: [...(messages[existing.id] || []), joinMsg],
    };

    saveConversations(side, nextConversations);
    saveMessages(side, nextMessages);
    return existing.id;
  }

  // Create the activity group chat on first join
  const convId = `c-activity-${activity.id}`;
  const participants: Participant[] = [
    creator,
    ...(creator.id === CURRENT_USER.id ? [] : [CURRENT_USER]),
  ];
  const groupName = activity.emoji
    ? `${activity.emoji} ${activity.title}`
    : activity.title;

  const newConv: Conversation = {
    id: convId,
    isGroup: true,
    groupName,
    groupImage: activity.image,
    participants,
    lastMessage:
      creator.id === CURRENT_USER.id
        ? `You created this activity`
        : `${CURRENT_USER.name} joined the activity`,
    lastMessageAt: now,
    lastSenderId: CURRENT_USER.id,
    unreadCount: 0,
    createdBy: creator.id,
  };

  const welcomeMsg: Message = {
    id: `m-act-${Date.now()}`,
    conversationId: convId,
    senderId: creator.id,
    text: `Welcome to ${activity.title} at ${activity.locationLabel}. Say hi and share plans!`,
    createdAt: now,
    read: true,
  };

  saveConversations(side, [newConv, ...conversations]);
  saveMessages(side, { ...messages, [convId]: [welcomeMsg] });
  return convId;
}

/**
 * Partner-side helper: get or create a group conversation for a given trip,
 * populated with Participants derived from its bookings so the host has a
 * single place to message everyone. Creates on first call; idempotent.
 */
export function getOrCreatePartnerTripGroupChat(
  trip: { id: string; title: string; coverImage?: string },
  bookings: Array<{
    bookingId: string;
    contact: { firstName: string; lastName: string; email: string };
  }>
): string | null {
  if (typeof window === "undefined") return null;

  const side: Side = "partner";
  const conversations = loadConversations(side);
  const messages = loadMessages(side);
  const existing = conversations.find(
    (c) =>
      c.isGroup &&
      (c.tripId === trip.id ||
        (!!c.tripTitle && c.tripTitle === trip.title))
  );
  if (existing) return existing.id;

  const bookingParticipants: Participant[] = bookings.map((b) => ({
    id: `tb-${b.bookingId}`,
    name: `${b.contact.firstName} ${b.contact.lastName}`,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      `${b.contact.firstName} ${b.contact.lastName}`
    )}`,
    role: "traveler",
  }));

  const now = new Date().toISOString();
  const convId = `c-partner-group-${trip.id}`;
  const newConv: Conversation = {
    id: convId,
    isGroup: true,
    groupName: trip.title,
    groupImage: trip.coverImage,
    participants: [CURRENT_PARTNER, ...bookingParticipants],
    tripId: trip.id,
    tripTitle: trip.title,
    tripImage: trip.coverImage,
    lastMessage: "Group chat created",
    lastMessageAt: now,
    lastSenderId: CURRENT_PARTNER.id,
    unreadCount: 0,
    createdBy: CURRENT_PARTNER.id,
  };

  const welcomeMsg: Message = {
    id: `m-pgrp-${Date.now()}`,
    conversationId: convId,
    senderId: CURRENT_PARTNER.id,
    text: `Trip group for ${trip.title} — everyone who booked is here.`,
    createdAt: now,
    read: true,
  };

  saveConversations(side, [newConv, ...conversations]);
  saveMessages(side, { ...messages, [convId]: [welcomeMsg] });
  return convId;
}

/**
 * Partner-side helper used by the reminder flow: appends a system message
 * into the partner trip group chat so the host has a visible record of
 * what was sent out. No-op if no such group exists yet.
 */
export function logPartnerTripSystemMessage(
  tripId: string,
  tripTitle: string,
  text: string
): void {
  if (typeof window === "undefined") return;
  const side: Side = "partner";
  const conversations = loadConversations(side);
  const messages = loadMessages(side);
  const target = conversations.find(
    (c) =>
      c.isGroup &&
      (c.tripId === tripId || (!!c.tripTitle && c.tripTitle === tripTitle))
  );
  if (!target) return;
  const now = new Date().toISOString();
  const msg: Message = {
    id: `m-sys-${Date.now()}`,
    conversationId: target.id,
    senderId: CURRENT_PARTNER.id,
    text,
    createdAt: now,
    read: true,
  };
  const nextMessages = {
    ...messages,
    [target.id]: [...(messages[target.id] || []), msg],
  };
  const nextConversations = conversations.map((c) =>
    c.id === target.id
      ? {
          ...c,
          lastMessage: text,
          lastMessageAt: now,
          lastSenderId: CURRENT_PARTNER.id,
        }
      : c
  );
  saveConversations(side, nextConversations);
  saveMessages(side, nextMessages);
}
