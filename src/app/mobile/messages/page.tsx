"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomTabs } from "@/components/mobile/bottom-tabs";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { useConversations } from "@/hooks/use-conversations";
import { formatRelativeTime } from "@/lib/format-time";
import { CURRENT_USER } from "@/data/conversations";
import { cn } from "@/lib/utils";

export default function MobileMessagesPage() {
  const { conversations, hydrated, totalUnread } = useConversations("user");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const other = c.participants.find((p) => p.id !== CURRENT_USER.id);
      return (
        other?.name.toLowerCase().includes(q) ||
        c.tripTitle?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
      );
    });
  }, [conversations, search]);

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title="Messages"
        showBack={false}
        action={
          totalUnread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
              {totalUnread}
            </span>
          )
        }
      />

      {/* Search */}
      <div className="bg-white border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-muted/50 border-0"
          />
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
            <p className="font-semibold text-sm">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
              Chat with your hosts after you book a trip.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((c) => {
              const other = c.participants.find(
                (p) => p.id !== CURRENT_USER.id
              );
              if (!other) return null;
              return (
                <Link
                  key={c.id}
                  href={`/mobile/messages/${c.id}`}
                  className="flex items-center gap-3 p-3.5 bg-white hover:bg-muted/30 transition-colors"
                >
                  <div className="relative shrink-0">
                    <Image
                      src={other.avatar}
                      alt={other.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover h-12 w-12"
                    />
                    {other.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
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
                        {other.name}
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
