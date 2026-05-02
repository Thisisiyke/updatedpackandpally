"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, Send, MessageCircle, Phone, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversations } from "@/hooks/use-conversations";
import {
  useTravelerMessagesApi,
  type TravelerInboxApi,
} from "@/hooks/use-traveler-messages-api";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { formatRelativeTime, formatTime, formatDay } from "@/lib/format-time";
import { CURRENT_USER, CURRENT_PARTNER } from "@/data/conversations";
import type { Message } from "@/types/messaging";
import { cn } from "@/lib/utils";

function groupByDay(msgs: Message[]) {
  const groups: { label: string; items: Message[] }[] = [];
  msgs.forEach((m) => {
    const label = formatDay(m.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(m);
    else groups.push({ label, items: [m] });
  });
  return groups;
}

export function InlineMessages({
  side,
  fullHeight,
  /** Inbox from parent (e.g. dashboard) to avoid a duplicate `/api/me/messages/inbox` fetch. */
  sharedTravelerInbox,
}: {
  side: "user" | "partner";
  /** Fill viewport under the site header (e.g. partner /messages). */
  fullHeight?: boolean;
  sharedTravelerInbox?: TravelerInboxApi;
}) {
  const { user: packUser } = usePackPallyAuth();
  /** Same Wanderly-backed inbox as the React Native app; hosts use their account id like travelers. */
  const useLive =
    (side === "user" || side === "partner") &&
    Boolean(packUser?.id) &&
    packUser?.role !== "guest";

  const useInternalInbox =
    useLive && !(side === "user" && sharedTravelerInbox);
  const local = useConversations(side);
  const liveInternal = useTravelerMessagesApi(useInternalInbox);
  const live: TravelerInboxApi =
    side === "user" && sharedTravelerInbox
      ? sharedTravelerInbox
      : liveInternal;

  const conversations = useLive ? live.conversations : local.conversations;
  const hydrated = useLive ? live.hydrated : local.hydrated;
  const getMessages = useLive ? live.getMessages : local.getMessages;
  const sendMessage = useLive ? live.sendMessage : local.sendMessage;
  const markRead = useLive ? live.markRead : local.markRead;
  const loadThread = useLive ? live.loadThread : null;

  const me = useLive
    ? live.meId
    : side === "user"
      ? CURRENT_USER.id
      : CURRENT_PARTNER.id;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated && !selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [hydrated, selectedId, conversations]);

  useEffect(() => {
    if (useLive && loadThread && selectedId) {
      void loadThread(selectedId);
    }
  }, [useLive, loadThread, selectedId]);

  const currentConv = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );
  const currentMsgs = useMemo(
    () => (selectedId ? getMessages(selectedId) : []),
    [selectedId, getMessages]
  );
  const grouped = useMemo(() => groupByDay(currentMsgs), [currentMsgs]);
  const other = currentConv?.participants.find((p) => p.id !== me);
  const isGroup = Boolean(currentConv?.isGroup);
  const displayName = isGroup
    ? (currentConv?.groupName || "Group")
    : (other?.name || "");
  const displayAvatar = isGroup
    ? (currentConv?.groupImage || other?.avatar || "")
    : (other?.avatar || "");

  useEffect(() => {
    if (selectedId && currentConv && currentConv.unreadCount > 0) {
      void markRead(selectedId);
    }
  }, [selectedId, currentConv, markRead]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [currentMsgs.length]);

  const filteredConvs = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const o = c.participants.find((p) => p.id !== me);
      return (
        c.groupName?.toLowerCase().includes(q) ||
        o?.name.toLowerCase().includes(q) ||
        c.tripTitle?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
      );
    });
  }, [conversations, search, me]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedId) return;
    void sendMessage(selectedId, input);
    setInput("");
  };

  return (
    <div
      className={cn(
        "flex w-full min-h-0 overflow-hidden bg-white",
        fullHeight
          ? "h-[calc(100vh-4rem)] border-y border-b"
          : "h-[640px] rounded-2xl border"
      )}
    >
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r flex flex-col">
        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 h-9 bg-muted/50 border-0"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!hydrated ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : useLive && live.error ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              {live.error}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="py-10 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold">No conversations</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConvs.map((c) => {
                const o = c.participants.find((p) => p.id !== me);
                const cIsGroup = Boolean(c.isGroup);
                if (!cIsGroup && !o) return null;
                const title = cIsGroup
                  ? (c.groupName || "Group")
                  : o!.name;
                const av = cIsGroup
                  ? (c.groupImage || o?.avatar)
                  : o!.avatar;
                const active = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 text-left transition-colors",
                      active
                        ? "bg-primary/5 border-l-4 border-l-primary pl-2"
                        : "hover:bg-muted/30"
                    )}
                  >
                    <div className="relative shrink-0">
                      {cIsGroup && c.groupImage ? (
                        <div className="relative h-9 w-9">
                          <Image
                            src={av || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                            alt={title}
                            width={36}
                            height={36}
                            className="rounded-xl object-cover h-9 w-9"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white border-2 border-white">
                            <Users className="h-2 w-2" />
                          </span>
                        </div>
                      ) : (
                        <>
                      <Image
                        src={av || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                        alt={title}
                        width={36}
                        height={36}
                        className="rounded-full object-cover h-9 w-9"
                      />
                      {o?.online && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm truncate",
                            c.unreadCount > 0 ? "font-bold" : "font-semibold"
                          )}
                        >
                          {title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatRelativeTime(c.lastMessageAt)}
                        </span>
                      </div>
                      {c.tripTitle && (
                        <p className="text-[10px] text-primary/80 font-medium truncate">
                          🧭 {c.tripTitle}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p
                          className={cn(
                            "text-xs truncate",
                            c.unreadCount > 0
                              ? "font-semibold"
                              : "text-muted-foreground"
                          )}
                        >
                          {c.lastMessage}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shrink-0">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Chat */}
      <section className="flex-1 flex flex-col bg-muted/10 min-w-0">
        {currentConv && (isGroup || other) ? (
          <>
            <header className="flex items-center gap-3 border-b bg-white px-4 py-2.5">
              <div className="relative shrink-0">
                <Image
                  src={
                    displayAvatar ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  }
                  alt={displayName}
                  width={36}
                  height={36}
                  className={
                    isGroup
                      ? "rounded-xl object-cover h-9 w-9"
                      : "rounded-full object-cover h-9 w-9"
                  }
                />
                {!isGroup && other?.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {isGroup
                    ? `Group · ${currentConv.participants.length} people`
                    : other?.online
                      ? "Active now"
                      : "Offline"}
                  {currentConv.tripTitle && ` · ${currentConv.tripTitle}`}
                </p>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
            >
              {grouped.map((group, gi) => (
                <div key={gi}>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-[10px] font-semibold text-muted-foreground bg-white border rounded-full px-3 py-1">
                      {group.label}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {group.items.map((m, mi) => {
                      const mine = m.senderId === me;
                      const next = group.items[mi + 1];
                      const isLast = !next || next.senderId !== m.senderId;
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            "flex items-end gap-2",
                            mine ? "justify-end" : "justify-start"
                          )}
                        >
                          {!mine && (
                            <div className="h-6 w-6 shrink-0">
                              {isLast && displayAvatar && (
                                <Image
                                  src={displayAvatar}
                                  alt=""
                                  width={24}
                                  height={24}
                                  className="rounded-full object-cover h-6 w-6"
                                />
                              )}
                            </div>
                          )}
                          <div
                            className={cn(
                              "max-w-[70%] px-3 py-2",
                              mine
                                ? "bg-primary text-white"
                                : "bg-white border",
                              "rounded-2xl",
                              mine && isLast && "rounded-br-sm",
                              !mine && isLast && "rounded-bl-sm"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words leading-snug">
                              {m.text}
                            </p>
                            {isLast && (
                              <p
                                className={cn(
                                  "text-[9px] mt-0.5",
                                  mine
                                    ? "text-white/70"
                                    : "text-muted-foreground"
                                )}
                              >
                                {formatTime(m.createdAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="bg-white border-t p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isGroup
                      ? "Message the group…"
                      : `Message ${displayName.split(" ")[0]}...`
                  }
                  className="h-10 rounded-full bg-muted/50 border-0 px-4"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 rounded-full shrink-0"
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white border">
                <MessageCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-semibold text-sm">Select a conversation</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
