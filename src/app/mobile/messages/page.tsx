"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MessageCircle, Pencil, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomTabs } from "@/components/mobile/bottom-tabs";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { useConversations } from "@/hooks/use-conversations";
import { formatRelativeTime } from "@/lib/format-time";
import { CURRENT_USER } from "@/data/conversations";
import type { Conversation } from "@/types/messaging";
import { cn } from "@/lib/utils";

function GroupAvatarStack({ conversation }: { conversation: Conversation }) {
  const others = conversation.participants.filter(
    (p) => p.id !== CURRENT_USER.id
  );
  const shown = others.slice(0, 3);

  if (conversation.groupImage) {
    return (
      <div className="relative h-12 w-12 shrink-0">
        <Image
          src={conversation.groupImage}
          alt={conversation.groupName || "Group"}
          width={48}
          height={48}
          className="rounded-2xl object-cover h-12 w-12"
        />
        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white border-2 border-white">
          <Users className="h-2.5 w-2.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12 shrink-0">
      {shown.map((p, i) => (
        <Image
          key={p.id}
          src={p.avatar}
          alt=""
          width={32}
          height={32}
          className={cn(
            "absolute h-8 w-8 rounded-full object-cover border-2 border-white",
            i === 0 && "top-0 left-0 z-10",
            i === 1 && "bottom-0 right-0 z-20",
            i === 2 && "bottom-0 left-2 z-30"
          )}
        />
      ))}
    </div>
  );
}

export default function MobileMessagesPage() {
  const { conversations, hydrated, totalUnread } = useConversations("user");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "direct" | "groups">("all");

  const filtered = useMemo(() => {
    let list = conversations;
    if (tab === "direct") list = list.filter((c) => !c.isGroup);
    if (tab === "groups") list = list.filter((c) => c.isGroup);

    const q = search.toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const other = c.participants.find((p) => p.id !== CURRENT_USER.id);
      return (
        c.groupName?.toLowerCase().includes(q) ||
        other?.name.toLowerCase().includes(q) ||
        c.tripTitle?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
      );
    });
  }, [conversations, search, tab]);

  const counts = {
    all: conversations.length,
    direct: conversations.filter((c) => !c.isGroup).length,
    groups: conversations.filter((c) => c.isGroup).length,
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title="Messages"
        showBack={false}
        action={
          <div className="flex items-center gap-2">
            {totalUnread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                {totalUnread}
              </span>
            )}
            <Link
              href="/mobile/messages/new-group"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
              aria-label="New group"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </div>
        }
      />

      {/* Search + tabs */}
      <div className="bg-white border-b px-4 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-muted/50 border-0"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
          {[
            { value: "all", label: `All (${counts.all})` },
            { value: "direct", label: `Direct (${counts.direct})` },
            { value: "groups", label: `Groups (${counts.groups})` },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value as any)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors",
                tab === t.value
                  ? "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {!hydrated ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MessageCircle className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm">
              {tab === "groups"
                ? "No group chats yet"
                : "No conversations yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
              {tab === "groups"
                ? "Create a group with your fellow travelers and host."
                : "Chat with your hosts after you book a trip."}
            </p>
            {tab === "groups" && (
              <Link
                href="/mobile/messages/new-group"
                className="inline-flex items-center gap-1 mt-4 rounded-full bg-primary text-white px-4 py-2 text-xs font-semibold"
              >
                <Pencil className="h-3 w-3" />
                New group
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((c) => {
              const isGroup = !!c.isGroup;
              const other = c.participants.find(
                (p) => p.id !== CURRENT_USER.id
              );
              if (!isGroup && !other) return null;

              const title = isGroup
                ? c.groupName || "Group"
                : other!.name;

              return (
                <Link
                  key={c.id}
                  href={`/mobile/messages/${c.id}`}
                  className="flex items-center gap-3 p-3.5 bg-white hover:bg-muted/30 transition-colors"
                >
                  {isGroup ? (
                    <GroupAvatarStack conversation={c} />
                  ) : (
                    <div className="relative shrink-0">
                      <Image
                        src={other!.avatar}
                        alt={other!.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover h-12 w-12"
                      />
                      {other!.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p
                          className={cn(
                            "text-sm truncate",
                            c.unreadCount > 0 ? "font-bold" : "font-semibold"
                          )}
                        >
                          {title}
                        </p>
                        {isGroup && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            · {c.participants.length}
                          </span>
                        )}
                      </div>
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
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <BottomTabs />
    </div>
  );
}
