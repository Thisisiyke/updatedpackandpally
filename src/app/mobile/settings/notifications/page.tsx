"use client";

import { useState } from "react";
import { Check, Bell, Mail, MessageSquare } from "lucide-react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { cn } from "@/lib/utils";

type Channel = "push" | "email" | "sms";

type Setting = {
  id: string;
  label: string;
  description: string;
  channels: Record<Channel, boolean>;
};

const initial: Setting[] = [
  {
    id: "booking-updates",
    label: "Booking updates",
    description: "Confirmations, itinerary changes, flight delays",
    channels: { push: true, email: true, sms: true },
  },
  {
    id: "check-in-reminders",
    label: "Check-in reminders",
    description: "Reminders 24h before departure or hotel check-in",
    channels: { push: true, email: true, sms: false },
  },
  {
    id: "payments",
    label: "Payments & receipts",
    description: "Transaction confirmations and refund updates",
    channels: { push: false, email: true, sms: false },
  },
  {
    id: "messages",
    label: "Host messages",
    description: "When hosts or fellow travelers send you a message",
    channels: { push: true, email: true, sms: false },
  },
  {
    id: "price-alerts",
    label: "Price alerts",
    description: "Notify me when saved trips or flights change price",
    channels: { push: true, email: true, sms: false },
  },
  {
    id: "deals",
    label: "Deals & promotions",
    description: "Exclusive offers and travel inspiration",
    channels: { push: false, email: false, sms: false },
  },
];

const channelIcons: Record<Channel, any> = {
  push: Bell,
  email: Mail,
  sms: MessageSquare,
};

export default function MobileNotificationSettingsPage() {
  const [settings, setSettings] = useState(initial);

  const toggle = (id: string, channel: Channel) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, channels: { ...s.channels, [channel]: !s.channels[channel] } }
          : s
      )
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Notifications" />

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Channel legend */}
        <div className="rounded-xl bg-white border p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Channels
          </p>
          <div className="flex items-center justify-around text-xs">
            {(["push", "email", "sms"] as Channel[]).map((ch) => {
              const Icon = channelIcons[ch];
              return (
                <div key={ch} className="flex flex-col items-center gap-1">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {ch === "push" ? "Push" : ch === "email" ? "Email" : "SMS"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings list */}
        <div className="rounded-2xl bg-white border divide-y">
          {settings.map((s) => (
            <div key={s.id} className="p-4">
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                {s.description}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["push", "email", "sms"] as Channel[]).map((ch) => {
                  const active = s.channels[ch];
                  return (
                    <button
                      key={ch}
                      onClick={() => toggle(s.id, ch)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg border py-2 text-[11px] font-semibold transition-all",
                        active
                          ? "border-primary bg-primary/5 text-primary"
                          : "text-muted-foreground hover:bg-muted/30"
                      )}
                    >
                      {active && <Check className="h-3 w-3" />}
                      {ch === "push" ? "Push" : ch === "email" ? "Email" : "SMS"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quiet hours */}
        <div className="rounded-2xl bg-white border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Quiet hours</p>
              <p className="text-[11px] text-muted-foreground">
                No pushes between 10 PM and 7 AM
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-10 h-5 bg-muted peer-checked:bg-primary rounded-full peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform" />
            </label>
          </div>
        </div>

        <p className="text-[10px] text-center text-muted-foreground pt-2">
          Emergency updates (major flight cancellations, safety alerts) will always be sent.
        </p>
      </div>
    </div>
  );
}
