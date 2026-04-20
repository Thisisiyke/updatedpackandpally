"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Send, MoreVertical, Phone, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { useConversations } from "@/hooks/use-conversations";
import { CURRENT_USER } from "@/data/conversations";
import { formatTime, formatDay } from "@/lib/format-time";
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

export default function MobileChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getConversation, getMessages, sendMessage, markRead, hydrated } =
    useConversations("user");

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = getConversation(id);
  const msgs = useMemo(() => getMessages(id), [getMessages, id]);
  const grouped = useMemo(() => groupByDay(msgs), [msgs]);
  const other = conversation?.participants.find((p) => p.id !== CURRENT_USER.id);

  // Mark as read on open
  useEffect(() => {
    if (hydrated && conversation && conversation.unreadCount > 0) {
      markRead(id);
    }
  }, [hydrated, id, conversation, markRead]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs.length]);

  if (!hydrated) {
    return (
      <div className="flex h-full min-h-[844px] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!conversation || !other) {
    return (
      <div className="flex h-full min-h-[844px] flex-col">
        <MobileHeader title="Chat" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <p className="font-semibold">Conversation not found</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/mobile/messages")}
            >
              Back to messages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(id, input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b flex items-center gap-3 px-3 py-2 md:pt-14">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <Link
          href="#"
          className="flex items-center gap-2 flex-1 min-w-0"
        >
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
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{other.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {other.online ? "Active now" : "Your host"}
              {conversation.tripTitle && ` · ${conversation.tripTitle}`}
            </p>
          </div>
        </Link>

        <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors">
          <Phone className="h-4 w-4" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors">
          <MoreVertical className="h-4 w-4" />
        </button>
      </header>

      {/* Trip context card */}
      {conversation.tripTitle && conversation.tripImage && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl bg-white border p-2 shadow-sm">
          <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={conversation.tripImage}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground">Trip context</p>
            <p className="text-xs font-semibold truncate">
              {conversation.tripTitle}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {grouped.map((group, gi) => (
          <div key={gi}>
            <div className="flex items-center justify-center mb-3">
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-3 py-1">
                {group.label}
              </span>
            </div>
            <div className="space-y-1.5">
              {group.items.map((m, mi) => {
                const mine = m.senderId === CURRENT_USER.id;
                const prev = group.items[mi - 1];
                const next = group.items[mi + 1];
                const isFirstInGroup =
                  !prev || prev.senderId !== m.senderId;
                const isLastInGroup =
                  !next || next.senderId !== m.senderId;

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
                        {isLastInGroup && (
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
                        "max-w-[75%] px-3 py-2",
                        mine
                          ? "bg-primary text-white"
                          : "bg-white border",
                        // Rounded corners with tail on first/last
                        isFirstInGroup && isLastInGroup
                          ? mine
                            ? "rounded-2xl rounded-br-sm"
                            : "rounded-2xl rounded-bl-sm"
                          : isFirstInGroup
                          ? mine
                            ? "rounded-2xl"
                            : "rounded-2xl"
                          : isLastInGroup
                          ? mine
                            ? "rounded-2xl rounded-br-sm"
                            : "rounded-2xl rounded-bl-sm"
                          : "rounded-2xl"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-snug">
                        {m.text}
                      </p>
                      {isLastInGroup && (
                        <p
                          className={cn(
                            "text-[9px] mt-0.5",
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
        className="sticky bottom-0 bg-white border-t p-3 md:pb-8"
      >
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            className="h-11 rounded-full bg-muted/50 border-0 px-4"
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
    </div>
  );
}
