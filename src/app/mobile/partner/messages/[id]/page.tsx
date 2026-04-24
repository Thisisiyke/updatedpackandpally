"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Users, ChevronLeft, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConversations } from "@/hooks/use-conversations";
import { CURRENT_PARTNER } from "@/data/conversations";
import { formatTime, formatDay } from "@/lib/format-time";
import type { Message, Participant } from "@/types/messaging";
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

export default function MobilePartnerThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getConversation, getMessages, sendMessage, markRead, hydrated } =
    useConversations("partner");

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = getConversation(id);
  const msgs = useMemo(() => getMessages(id), [getMessages, id]);
  const grouped = useMemo(() => groupByDay(msgs), [msgs]);
  const isGroup = !!conversation?.isGroup;
  const other = conversation?.participants.find(
    (p) => p.id !== CURRENT_PARTNER.id
  );

  const participantById = useMemo(() => {
    const map = new Map<string, Participant>();
    conversation?.participants.forEach((p) => map.set(p.id, p));
    return map;
  }, [conversation]);

  useEffect(() => {
    if (hydrated && conversation && conversation.unreadCount > 0) {
      markRead(id);
    }
  }, [hydrated, id, conversation, markRead]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs.length]);

  if (!hydrated) {
    return (
      <div className="flex h-full min-h-[844px] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!conversation || (!isGroup && !other)) {
    return (
      <div className="flex h-full min-h-[844px] flex-col">
        <header className="sticky top-0 z-30 bg-white border-b flex items-center gap-2 px-3 py-2 md:pt-14">
          <button
            onClick={() => router.push("/mobile/partner/messages")}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-semibold">Conversation</p>
        </header>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <p className="font-semibold">Conversation not found</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/mobile/partner/messages")}
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

  const headerTitle = isGroup
    ? conversation.groupName || conversation.tripTitle || "Group"
    : other!.name;
  const headerSubtitle = isGroup
    ? `${conversation.participants.length} members${
        conversation.tripTitle ? ` · ${conversation.tripTitle}` : ""
      }`
    : conversation.tripTitle || "Direct message";

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b flex items-center gap-3 px-3 py-2 md:pt-14">
        <button
          onClick={() => router.push("/mobile/partner/messages")}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {isGroup ? (
          <Link
            href={`/mobile/partner/messages/${id}/info`}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <div className="relative h-10 w-10 shrink-0">
              {conversation.groupImage ? (
                <Image
                  src={conversation.groupImage}
                  alt={conversation.groupName || "Group"}
                  width={40}
                  height={40}
                  className="rounded-xl object-cover h-10 w-10"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{headerTitle}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {headerSubtitle}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src={other!.avatar}
                alt={other!.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              {other!.online && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{headerTitle}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {headerSubtitle}
              </p>
            </div>
          </div>
        )}

        {isGroup && (
          <Link
            href={`/mobile/partner/messages/${id}/info`}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted shrink-0"
            aria-label="Group info"
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4">
        {grouped.length === 0 ? (
          <div className="py-20 text-center text-xs text-muted-foreground">
            No messages yet — say hi.
          </div>
        ) : (
          grouped.map((g, gi) => (
            <div key={gi} className="space-y-1.5">
              <p className="text-center text-[10px] font-semibold text-muted-foreground my-3">
                {g.label}
              </p>
              {g.items.map((m, i) => {
                const mine = m.senderId === CURRENT_PARTNER.id;
                const sender = participantById.get(m.senderId);
                const prev = g.items[i - 1];
                const newSender = !prev || prev.senderId !== m.senderId;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex items-end gap-1.5",
                      mine ? "justify-end" : "justify-start"
                    )}
                  >
                    {!mine && (
                      <div className="h-6 w-6 shrink-0">
                        {newSender && sender && (
                          <Image
                            src={sender.avatar}
                            alt={sender.name}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        )}
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-3 py-2",
                        mine
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-white border rounded-bl-md"
                      )}
                    >
                      {!mine && newSender && isGroup && sender && (
                        <p className="text-[10px] font-semibold text-primary mb-0.5">
                          {sender.name}
                        </p>
                      )}
                      <p
                        className={cn(
                          "text-sm leading-snug whitespace-pre-wrap",
                          mine ? "text-white" : "text-foreground"
                        )}
                      >
                        {m.text}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          mine ? "text-white/70" : "text-muted-foreground"
                        )}
                      >
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 bg-white border-t p-3 md:pb-6 flex items-end gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isGroup
              ? `Message ${conversation.participants.length - 1} travelers…`
              : `Reply to ${other!.name.split(" ")[0]}…`
          }
          className="flex-1 h-10"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim()}
          className="h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
