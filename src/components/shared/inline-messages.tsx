"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, Send, MessageCircle, Phone, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversations } from "@/hooks/use-conversations";
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

export function InlineMessages({ side }: { side: "user" | "partner" }) {
  const {
    conversations,
    hydrated,
    getMessages,
    sendMessage,
    markRead,
  } = useConversations(side);

  const me = side === "user" ? CURRENT_USER.id : CURRENT_PARTNER.id;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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
  const other = currentConv?.participants.find((p) => p.id !== me);

  useEffect(() => {
    if (selectedId && currentConv && currentConv.unreadCount > 0) {
      markRead(selectedId);
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
        o?.name.toLowerCase().includes(q) ||
        c.tripTitle?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
      );
    });
  }, [conversations, search, me]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedId) return;
    sendMessage(selectedId, input);
    setInput("");
  };

  return (
    <div className="flex h-[640px] rounded-2xl border bg-white overflow-hidden">
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
          ) : filteredConvs.length === 0 ? (
            <div className="py-10 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold">No conversations</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConvs.map((c) => {
                const o = c.participants.find((p) => p.id !== me);
                if (!o) return null;
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
                      <Image
                        src={o.avatar}
                        alt={o.name}
                        width={36}
                        height={36}
                        className="rounded-full object-cover h-9 w-9"
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

      {/* Chat */}
      <section className="flex-1 flex flex-col bg-muted/10 min-w-0">
        {currentConv && other ? (
          <>
            <header className="flex items-center gap-3 border-b bg-white px-4 py-2.5">
              <div className="relative shrink-0">
                <Image
                  src={other.avatar}
                  alt={other.name}
                  width={36}
                  height={36}
                  className="rounded-full object-cover h-9 w-9"
                />
                {other.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{other.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {other.online ? "Active now" : "Offline"}
                  {currentConv.tripTitle && ` · ${currentConv.tripTitle}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Phone className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
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
                              {isLast && (
                                <Image
                                  src={other.avatar}
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
                  placeholder={`Message ${other.name.split(" ")[0]}...`}
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
