"use client";

import { InlineMessages } from "@/components/shared/inline-messages";

/**
 * Host/partner inbox: same Wanderly APIs as the mobile app
 * (`/chat/chat_history`, `get-bookingsChat`, DMs, group chats).
 */
export default function PartnerMessagesPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col">
      <InlineMessages side="partner" fullHeight />
    </div>
  );
}
