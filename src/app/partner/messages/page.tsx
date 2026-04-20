"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, Send, MessageCircle, Phone, Video, MoreHorizontal, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversations } from "@/hooks/use-conversations";
import { formatRelativeTime, formatTime, formatDay } from "@/lib/format-time";
import { CURRENT_PARTNER } from "@/data/conversations";
import type { Message } from "@/types/messaging";
import { cn } from "@/lib/utils";

function groupByDay(msgs: Message[]) {
  const groups: { label: string; items: Message[] }[] = [];
  msgs.forEach((m) => {
    const label = formatDay(m.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(m);
    } else {
      groups.push({ label, items: [m] });
    }
  });
  return groups;
}

export default function PartnerMessagesPage() {
  const {
    conversations,
    hydrated,
    getMessages,
    sendMessage,
    markRead,
    totalUnread,
  } = useConversations("partner");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-select first on load
  useEffect(() => {
    if (hydrated && !selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [hydrated, selectedId, conversations]);

  const currentConv = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );
  const currentMsgs = useMemo(
    () => (selectedId ? getMessages(selectedId) : []),
    [selectedId, getMessages]
  );
  const grouped = useMemo(() => groupByDay(currentMsgs), [currentMsgs]);
  const other = currentConv?.participants.find(
    (p) => p.id !== CURRENT_PARTNER.id
  );

  // Mark as read when opened
  useEffect(() => {
    if (selectedId && currentConv && currentConv.unreadCount > 0) {
      markRead(selectedId);
    }
  }, [selectedId, currentConv, markRead]);

  // Auto-scroll on new message
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
      const o = c.participants.find((p) => p.id !== CURRENT_PARTNER.id);
      return (
        o?.name.toLowerCase().includes(q) ||
        c.tripTitle?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
      );
    });
  }, [conversations, search]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedId) return;
    sendMessage(selectedId, input);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar list */}
      <aside className="w-80 shrink-0 border-r bg-white flex flex-col">
        <div className="px-5 py-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">Messages</h1>
            {totalUnread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-2 text-[10px] font-bold text-white">
                {totalUnread}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-0"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!hydrated ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="py-10 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold">No conversations</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConvs.map((c) => {
                const o = c.participants.find(
                  (p) => p.id !== CURRENT_PARTNER.id
                );
                if (!o) return null;
                const active = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3.5 text-left transition-colors",
                      active
                        ? "bg-primary/5 border-l-4 border-l-primary pl-[11px]"
                        : "hover:bg-muted/30"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Image
                        src={o.avatar}
                        alt={o.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover h-10 w-10"
                      />
                      {o.online && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
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
                          {o.name}
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

      {/* Chat panel */}
      <section className="flex-1 flex flex-col bg-muted/10 min-w-0">
        {currentConv && other ? (
          <>
            {/* Chat header */}
            <header className="flex items-center gap-3 border-b bg-white px-5 py-3">
              <div className="relative shrink-0">
                <Image
                  src={other.avatar}
                  alt={other.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover h-10 w-10"
                />
                {other.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{other.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {other.online ? "Active now" : "Offline"}
                  {currentConv.tripTitle && ` · ${currentConv.tripTitle}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {grouped.map((group, gi) => (
                <div key={gi}>
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-[10px] font-semibold text-muted-foreground bg-white border rounded-full px-3 py-1">
                      {group.label}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {group.items.map((m, mi) => {
                      const mine = m.senderId === CURRENT_PARTNER.id;
                      const prev = group.items[mi - 1];
                      const next = group.items[mi + 1];
                      const isFirst = !prev || prev.senderId !== m.senderId;
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
                            <div className="h-7 w-7 shrink-0">
                              {isLast && (
                                <Image
                                  src={other.avatar}
                                  alt=""
                                  width={28}
                                  height={28}
                                  className="rounded-full object-cover h-7 w-7"
                                />
                              )}
                            </div>
                          )}
                          <div
                            className={cn(
                              "max-w-[60%] px-3.5 py-2",
                              mine
                                ? "bg-primary text-white"
                                : "bg-white border",
                              isFirst && isLast
                                ? mine
                                  ? "rounded-2xl rounded-br-sm"
                                  : "rounded-2xl rounded-bl-sm"
                                : "rounded-2xl"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words leading-snug">
                              {m.text}
                            </p>
                            {isLast && (
                              <p
                                className={cn(
                                  "text-[10px] mt-0.5",
                                  mine ? "text-white/70" : "text-muted-foreground"
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

            {/* Composer */}
            <form
              onSubmit={handleSend}
              className="bg-white border-t p-4"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message ${other.name.split(" ")[0]}...`}
                  className="h-11 rounded-full bg-muted/50 border-0 px-5"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 rounded-full shrink-0"
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white border">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-semibold">Select a conversation</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pick a traveler on the left to start chatting
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
