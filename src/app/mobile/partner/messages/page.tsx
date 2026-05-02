"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MessageCircle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { PartnerBottomTabs } from "@/components/mobile/partner-bottom-tabs";
import { useTravelerMessagesApi } from "@/hooks/use-traveler-messages-api";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { formatRelativeTime } from "@/lib/format-time";
import type { Conversation } from "@/types/messaging";
import { cn } from "@/lib/utils";

type Tab = "all" | "direct" | "groups";

function GroupAvatarStack({
  conversation,
  meId,
}: {
  conversation: Conversation;
  meId: string;
}) {
  const others = conversation.participants.filter((p) => p.id !== meId);
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
          key={p.id + i}
          src={p.avatar}
          alt=""
          width={32}
          height={32}
          className={cn(
            "absolute h-8 w-8 rounded-full object-cover border-2 border-white",
            i === 0 && "top-0 left-0 z-10",
            i === 1 && "bottom-0 right-0 z-20",
            i === 2 && "top-0 right-0 z-0 opacity-80"
          )}
        />
      ))}
      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white border-2 border-white">
        <Users className="h-2.5 w-2.5" />
      </div>
    </div>
  );
}

function DirectAvatar({
  conversation,
  meId,
}: {
  conversation: Conversation;
  meId: string;
}) {
  const other = conversation.participants.find((p) => p.id !== meId);
  if (!other) {
    return <div className="h-12 w-12 rounded-full bg-muted shrink-0" />;
  }
  return (
    <div className="relative h-12 w-12 shrink-0">
      <Image
        src={other.avatar}
        alt={other.name}
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover"
      />
      {other.online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
      )}
    </div>
  );
}

export default function MobilePartnerMessagesPage() {
  const { user: packUser } = usePackPallyAuth();
  const useLive =
    Boolean(packUser?.id) && packUser?.role !== "guest";
  const {
    conversations,
    hydrated,
    error,
    meId,
  } = useTravelerMessagesApi(useLive);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const direct = conversations.filter((c) => !c.isGroup).length;
    const groups = conversations.filter((c) => c.isGroup).length;
    return { all: conversations.length, direct, groups };
  }, [conversations]);

  const filtered = useMemo(() => {
    let list = conversations;
    if (tab === "direct") list = list.filter((c) => !c.isGroup);
    if (tab === "groups") list = list.filter((c) => c.isGroup);
    if (query.trim() && meId) {
      const q = query.toLowerCase();
      list = list.filter((c) => {
        const title = c.isGroup
          ? c.groupName || ""
          : c.participants.find((p) => p.id !== meId)?.name || "";
        return (
          title.toLowerCase().includes(q) ||
          (c.tripTitle || "").toLowerCase().includes(q) ||
          (c.lastMessage || "").toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [conversations, tab, query, meId]);

  return (
    <div className="relative flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Messages" showBack={false} />

      {/* Search + tabs */}
      <div className="bg-white border-b px-5 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search travelers, trips, messages…"
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(
            [
              { k: "all", l: `All (${counts.all})` },
              { k: "direct", l: `Direct (${counts.direct})` },
              { k: "groups", l: `Groups (${counts.groups})` },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => setTab(t.k)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
                tab === t.k
                  ? "bg-white shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-2">
        {!hydrated ? (
          <div className="py-20 text-center text-xs text-muted-foreground">
            Loading…
          </div>
        ) : error ? (
          <div className="px-4 py-20 text-center text-xs text-muted-foreground">
            {error}
          </div>
        ) : !meId ? (
          <div className="py-20 text-center text-xs text-muted-foreground px-4">
            Sign in to see your messages.
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <MessageCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm">No conversations</p>
            <p className="text-xs text-muted-foreground mt-1">
              {tab === "groups"
                ? "Create a group from a trip to message all travelers at once."
                : "Travelers' messages will appear here once they reach out."}
            </p>
          </div>
        ) : (
          <div className="bg-white divide-y">
            {filtered.map((c) => {
              const title = c.isGroup
                ? c.groupName || c.tripTitle || "Group"
                : c.participants.find((p) => p.id !== meId)?.name ||
                  "Conversation";
              const showUnread = c.unreadCount > 0;

              return (
                <Link
                  key={c.id}
                  href={`/mobile/partner/messages/${c.id}`}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  {c.isGroup ? (
                    <GroupAvatarStack conversation={c} meId={meId} />
                  ) : (
                    <DirectAvatar conversation={c} meId={meId} />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm truncate",
                          showUnread ? "font-bold" : "font-semibold"
                        )}
                      >
                        {title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {c.lastMessageAt
                          ? formatRelativeTime(c.lastMessageAt)
                          : ""}
                      </span>
                    </div>
                    {c.tripTitle && c.isGroup === undefined && (
                      <p className="text-[10px] text-primary truncate">
                        {c.tripTitle}
                      </p>
                    )}
                    {!c.isGroup && c.tripTitle && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {c.tripTitle}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={cn(
                          "text-xs truncate",
                          showUnread
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {c.lastMessage || "No messages yet"}
                      </p>
                      {showUnread && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white px-1.5 shrink-0">
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

      <PartnerBottomTabs />
    </div>
  );
}
