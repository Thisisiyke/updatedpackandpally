"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Save,
  Check,
  Bell,
  Mail,
  Smartphone,
  Inbox,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NOTIFICATION_EVENTS,
  getHostNotificationSettings,
  saveHostNotificationSettings,
  type HostNotificationSettings,
  type NotificationChannel,
  type NotificationEventKey,
} from "@/lib/host-notifications";
import { cn } from "@/lib/utils";

const CHANNEL_META: {
  key: NotificationChannel;
  label: string;
  hint: string;
  icon: typeof Mail;
}[] = [
  { key: "email", label: "Email", hint: "Inbox alerts", icon: Mail },
  { key: "push", label: "Push", hint: "Mobile app", icon: Smartphone },
  { key: "inApp", label: "In-app", hint: "Bell badge", icon: Inbox },
];

const GROUP_ORDER: ("Bookings" | "Payments" | "Platform")[] = [
  "Bookings",
  "Payments",
  "Platform",
];

export default function NotificationsSettingsPage() {
  const [initial, setInitial] = useState<HostNotificationSettings | null>(
    null
  );
  const [settings, setSettings] = useState<HostNotificationSettings | null>(
    null
  );
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    const s = getHostNotificationSettings();
    setInitial(s);
    setSettings(s);
  }, []);

  const dirty = useMemo(() => {
    if (!initial || !settings) return false;
    return JSON.stringify(initial) !== JSON.stringify(settings);
  }, [initial, settings]);

  if (!settings) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const toggleChannel = (
    eventKey: NotificationEventKey,
    channel: NotificationChannel
  ) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            prefs: {
              ...prev.prefs,
              [eventKey]: {
                ...prev.prefs[eventKey],
                [channel]: !prev.prefs[eventKey][channel],
              },
            },
          }
        : prev
    );
  };

  const groupAllOn = (group: "Bookings" | "Payments" | "Platform") => {
    setSettings((prev) => {
      if (!prev) return prev;
      const nextPrefs = { ...prev.prefs };
      NOTIFICATION_EVENTS.filter((e) => e.group === group).forEach((e) => {
        nextPrefs[e.key] = { email: true, push: true, inApp: true };
      });
      return { ...prev, prefs: nextPrefs };
    });
  };

  const groupAllOff = (group: "Bookings" | "Payments" | "Platform") => {
    setSettings((prev) => {
      if (!prev) return prev;
      const nextPrefs = { ...prev.prefs };
      NOTIFICATION_EVENTS.filter((e) => e.group === group).forEach((e) => {
        nextPrefs[e.key] = { email: false, push: false, inApp: false };
      });
      return { ...prev, prefs: nextPrefs };
    });
  };

  const handleSave = () => {
    saveHostNotificationSettings(settings);
    setInitial(settings);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Notifications</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Pick which events reach you on email, push, and in-app — plus a
              weekly digest if you want a quieter inbox.
            </p>
          </div>
        </div>
      </div>

      {/* Weekly digest */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 shrink-0">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Weekly digest</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              A single Monday email summarizing bookings, revenue, and
              messages from the past 7 days. Doesn&apos;t replace urgent
              alerts.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.weeklyDigest}
            onClick={() =>
              setSettings({
                ...settings,
                weeklyDigest: !settings.weeklyDigest,
              })
            }
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
              settings.weeklyDigest
                ? "bg-primary"
                : "bg-muted-foreground/25"
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                settings.weeklyDigest ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </div>

      {/* Per-event grid */}
      {GROUP_ORDER.map((group) => {
        const events = NOTIFICATION_EVENTS.filter((e) => e.group === group);
        return (
          <div key={group} className="rounded-2xl border bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-5 border-b">
              <h3 className="font-bold">{group}</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => groupAllOn(group)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Turn all on
                </button>
                <span className="text-muted-foreground/40">·</span>
                <button
                  type="button"
                  onClick={() => groupAllOff(group)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Turn all off
                </button>
              </div>
            </div>

            {/* Channel header (desktop) */}
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-x-6 px-5 py-3 border-b bg-muted/20">
              <div />
              {CHANNEL_META.map((c) => (
                <div
                  key={c.key}
                  className="flex flex-col items-center gap-0.5 w-16"
                >
                  <c.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {c.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="divide-y">
              {events.map((evt) => {
                const row = settings.prefs[evt.key];
                return (
                  <div
                    key={evt.key}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-y-3 gap-x-6 items-center px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{evt.label}</p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {evt.hint}
                      </p>
                    </div>

                    <div className="flex md:hidden gap-2 mt-1">
                      {CHANNEL_META.map((c) => (
                        <ChannelToggle
                          key={c.key}
                          label={c.label}
                          icon={c.icon}
                          checked={row[c.key]}
                          onToggle={() => toggleChannel(evt.key, c.key)}
                        />
                      ))}
                    </div>

                    {CHANNEL_META.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        role="switch"
                        aria-checked={row[c.key]}
                        aria-label={`${c.label} ${evt.label}`}
                        onClick={() => toggleChannel(evt.key, c.key)}
                        className={cn(
                          "hidden md:inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors mx-auto",
                          row[c.key]
                            ? "bg-primary"
                            : "bg-muted-foreground/25"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                            row[c.key] ? "translate-x-5" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Save bar */}
      <div className="sticky bottom-0 -mx-6 lg:-mx-0 bg-white border-t px-6 lg:px-0 py-4 flex justify-end gap-2">
        <Button
          onClick={handleSave}
          disabled={!dirty}
          size="lg"
          className="gap-2"
        >
          {savedToast ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ChannelToggle({
  label,
  icon: Icon,
  checked,
  onToggle,
}: {
  label: string;
  icon: typeof Mail;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
        checked
          ? "border-primary bg-primary/10 text-primary"
          : "text-muted-foreground"
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}
