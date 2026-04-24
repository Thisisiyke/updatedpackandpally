"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Mail,
  Archive,
  Trash2,
  Reply,
  Forward,
  Star,
  MoreHorizontal,
  Phone,
  Video,
  Wallet,
  Shield,
  Bell,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { trips } from "@/data/trips";
import { hosts } from "@/data/hosts";
import {
  getReminderById,
  isReminderRead,
  markReminderRead,
  MY_BOOKING_IDS,
  subscribeToNotifications,
} from "@/lib/notifications";
import { getBookingsForTrip } from "@/lib/partner-bookings";
import { cn } from "@/lib/utils";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [tick, setTick] = useState(0);

  useEffect(() => subscribeToNotifications(() => setTick((t) => t + 1)), []);

  const reminder = useMemo(() => {
    void tick;
    return getReminderById(id);
  }, [id, tick]);

  // Mark as read on open
  useEffect(() => {
    if (reminder && !isReminderRead(reminder.id)) {
      markReminderRead(reminder.id);
    }
  }, [reminder]);

  if (!reminder) {
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-white">
        <MobileHeader title="Notification" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <p className="font-semibold">Notification not found</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/mobile/notifications")}
            >
              Back to notifications
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Resolve the booking + trip for context (which trip, how much owed)
  const myBookingId =
    reminder.recipientBookingIds.find((bid) => MY_BOOKING_IDS.includes(bid)) ||
    reminder.recipientBookingIds[0];

  // Find the booking in the host's store to pull the amount-due info
  const allTripBookings = reminder
    ? trips.flatMap((t) => getBookingsForTrip(t.id))
    : [];
  const myBooking = allTripBookings.find((b) => b.bookingId === myBookingId);
  const trip =
    myBooking && trips.find((t) => t.id === myBooking.tripId.replace("ptrip-", "trip-"));
  const host = trip ? hosts.find((h) => h.id === trip.hostId) : null;

  // Render merge tokens if present in the raw body
  const renderedBody = (myBooking && trip
    ? reminder.body
        .replace(/\{name\}/g, myBooking.contact.firstName)
        .replace(/\{tripTitle\}/g, trip.title)
        .replace(/\{amountDue\}/g, formatMoney(myBooking.amountDueLater))
        .replace(
          /\{dueDate\}/g,
          myBooking.paymentDueAt
            ? new Date(myBooking.paymentDueAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "your trip start"
        )
        .replace(/\{hostName\}/g, reminder.senderName)
    : reminder.body
  ).trim();

  const renderedSubject = (myBooking && trip
    ? (reminder.subject || "")
        .replace(/\{name\}/g, myBooking.contact.firstName)
        .replace(/\{tripTitle\}/g, trip.title)
        .replace(/\{amountDue\}/g, formatMoney(myBooking.amountDueLater))
    : reminder.subject || ""
  ).trim();

  if (reminder.channel === "email") {
    return (
      <EmailView
        reminder={reminder}
        subject={renderedSubject}
        body={renderedBody}
        host={host}
        amountDue={myBooking?.amountDueLater}
        myEmail={myBooking?.contact.email || "explorer@packpally.com"}
      />
    );
  }

  if (reminder.channel === "sms") {
    return (
      <SmsView
        reminder={reminder}
        body={renderedBody}
        host={host}
        amountDue={myBooking?.amountDueLater}
        myPhone={myBooking?.contact.phone || "+1 (415) 555-0199"}
      />
    );
  }

  return (
    <PushView
      reminder={reminder}
      body={renderedBody}
      host={host}
      amountDue={myBooking?.amountDueLater}
      tripTitle={trip?.title}
    />
  );
}

/* ───────── Email (Gmail-ish) ───────── */
function EmailView({
  reminder,
  subject,
  body,
  host,
  amountDue,
  myEmail,
}: {
  reminder: NonNullable<ReturnType<typeof getReminderById>>;
  subject: string;
  body: string;
  host: { name: string; avatar: string } | null | undefined;
  amountDue?: number;
  myEmail: string;
}) {
  return (
    <div className="flex flex-col h-full min-h-[844px] bg-white">
      {/* Gmail-style top bar */}
      <div className="flex items-center justify-between border-b bg-white px-3 h-12">
        <Link
          href="/mobile/notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
            <Archive className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
            <Trash2 className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
            <Mail className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Subject line */}
        <div className="px-4 pt-4">
          <div className="flex items-start gap-2">
            <h1 className="flex-1 text-xl font-bold leading-snug">
              {subject || "Payment reminder"}
            </h1>
            <button className="mt-1 flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted">
              <Star className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-[10px]">
              Inbox
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              From your trip host
            </Badge>
          </div>
        </div>

        {/* Sender row */}
        <div className="mt-4 px-4 py-3 flex items-start gap-3 border-y">
          <div className="relative h-10 w-10 overflow-hidden rounded-full shrink-0 bg-muted">
            {host?.avatar && (
              <Image
                src={host.avatar}
                alt={host.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm truncate">
                {reminder.senderName}
              </p>
              <p className="text-[11px] text-muted-foreground shrink-0">
                {new Date(reminder.sentAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              &lt;sofia@packandpally.com&gt;
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              to <span className="font-medium">me</span>{" "}
              <span className="text-muted-foreground/70">&lt;{myEmail}&gt;</span>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-5">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
            {body}
          </pre>

          {/* Payment CTA card */}
          {typeof amountDue === "number" && amountDue > 0 && (
            <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Balance remaining
                  </p>
                  <p className="text-xl font-bold">
                    {formatMoney(amountDue)}
                  </p>
                </div>
              </div>
              <Button className="mt-3 w-full gap-1.5" size="lg">
                <Wallet className="h-4 w-4" />
                Pay balance now
              </Button>
              <p className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure payment via Stripe
              </p>
            </div>
          )}

          {/* Signature footer */}
          <div className="mt-8 border-t pt-4 text-[11px] text-muted-foreground">
            Sent via Pack &amp; Pally. You&apos;re receiving this because you
            booked a trip with {reminder.senderName}.
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t bg-white px-4 py-3 flex items-center gap-2">
        <Button variant="outline" className="flex-1 gap-1.5" size="sm">
          <Reply className="h-4 w-4" />
          Reply
        </Button>
        <Button variant="outline" className="flex-1 gap-1.5" size="sm">
          <Forward className="h-4 w-4" />
          Forward
        </Button>
      </div>
    </div>
  );
}

/* ───────── SMS (iMessage-ish) ───────── */
function SmsView({
  reminder,
  body,
  host,
  amountDue,
  myPhone,
}: {
  reminder: NonNullable<ReturnType<typeof getReminderById>>;
  body: string;
  host: { name: string; avatar: string } | null | undefined;
  amountDue?: number;
  myPhone: string;
}) {
  const sentTime = new Date(reminder.sentAt);
  return (
    <div className="flex flex-col h-full min-h-[844px] bg-[#f2f2f7]">
      {/* iOS Messages header */}
      <div className="flex flex-col items-center border-b bg-[#f9f9f9]/90 backdrop-blur-lg px-3 pt-3 pb-2 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Link
            href="/mobile/notifications"
            className="flex items-center text-[#007aff] text-sm"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-0.5">Inbox</span>
          </Link>
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <button className="text-[#007aff]">
            <Video className="h-5 w-5" />
          </button>
          <button className="text-[#007aff]">
            <Phone className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative h-11 w-11 overflow-hidden rounded-full bg-muted mb-1">
            {host?.avatar && (
              <Image
                src={host.avatar}
                alt={host.name}
                fill
                sizes="44px"
                className="object-cover"
              />
            )}
          </div>
          <p className="text-xs font-semibold">{reminder.senderName}</p>
          <p className="text-[10px] text-muted-foreground">Host</p>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        <p className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Text Message ·{" "}
          {sentTime.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}{" "}
          {sentTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>

        {/* Host bubble */}
        <div className="flex items-end gap-1.5">
          <div className="relative h-6 w-6 overflow-hidden rounded-full shrink-0 bg-muted">
            {host?.avatar && (
              <Image
                src={host.avatar}
                alt={host.name}
                fill
                sizes="24px"
                className="object-cover"
              />
            )}
          </div>
          <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-[#e5e5ea] px-3 py-2">
            <p className="whitespace-pre-wrap text-[15px] leading-snug text-foreground">
              {body}
            </p>
          </div>
        </div>

        {/* Payment card as a bubble attachment */}
        {typeof amountDue === "number" && amountDue > 0 && (
          <div className="flex items-end gap-1.5">
            <div className="h-6 w-6 shrink-0" />
            <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-bl-md bg-white border shadow-sm">
              <div className="bg-gradient-to-br from-primary/10 via-white to-violet-500/10 p-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Pack &amp; Pally · Pay balance
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold">
                  {formatMoney(amountDue)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Outstanding balance on your trip
                </p>
              </div>
              <button className="w-full py-2.5 text-sm font-semibold text-[#007aff] border-t">
                Tap to pay now
              </button>
            </div>
          </div>
        )}

        {/* Read receipt */}
        <div className="flex items-end gap-1.5 pl-9">
          <span className="text-[10px] text-muted-foreground">Read</span>
        </div>
      </div>

      {/* iOS message composer */}
      <div className="border-t bg-[#f9f9f9]/90 backdrop-blur-lg px-3 py-2 flex items-end gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5e5ea] text-muted-foreground shrink-0">
          +
        </div>
        <div className="flex-1 rounded-full border bg-white px-3 py-1.5 text-sm text-muted-foreground">
          iMessage
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5e5ea] text-muted-foreground shrink-0 text-[11px] font-bold">
          Aa
        </div>
      </div>

      <p className="pb-2 text-center text-[10px] text-muted-foreground">
        Sent to {myPhone}
      </p>
    </div>
  );
}

/* ───────── Push (iOS lock-screen) ───────── */
function PushView({
  reminder,
  body,
  host,
  amountDue,
  tripTitle,
}: {
  reminder: NonNullable<ReturnType<typeof getReminderById>>;
  body: string;
  host: { name: string; avatar: string } | null | undefined;
  amountDue?: number;
  tripTitle?: string;
}) {
  const sentTime = new Date(reminder.sentAt);
  const timeStr = sentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const dateStr = sentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const bigTime = sentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
  const previewLine = body.split(/\n+/)[0] || body;

  return (
    <div
      className="flex flex-col h-full min-h-[844px] bg-cover bg-center relative text-white"
      style={{
        backgroundImage:
          "linear-gradient(160deg, #1a1a2e 0%, #16213e 35%, #0f3460 70%, #533483 100%)",
      }}
    >
      {/* Subtle light blobs for a lock-screen-y feel */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />

      {/* Back link */}
      <div className="relative z-10 flex items-center h-10 px-3">
        <Link
          href="/mobile/notifications"
          className="flex items-center gap-0.5 text-white/90 text-sm"
        >
          <ChevronLeft className="h-5 w-5" />
          Inbox
        </Link>
      </div>

      {/* Lock-screen time & date */}
      <div className="relative z-10 pt-4 flex flex-col items-center">
        <p className="text-[11px] tracking-widest uppercase text-white/60">
          {dateStr}
        </p>
        <p className="mt-0.5 text-[72px] font-thin leading-none tabular-nums">
          {bigTime}
        </p>
      </div>

      {/* The push notification card */}
      <div className="relative z-10 mt-8 px-3">
        <p className="text-[11px] font-semibold tracking-wider uppercase text-white/50 mb-2 px-1">
          Notification
        </p>
        <div className="rounded-2xl overflow-hidden bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex items-start gap-2 px-3 py-2 border-b border-white/10">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-violet-500 shadow-sm">
              <Compass className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[11px] font-semibold text-white/95">
              PACK &amp; PALLY
            </span>
            <span className="ml-auto text-[11px] text-white/60">
              {timeStr}
            </span>
          </div>
          <div className="px-3 py-3">
            <p className="text-[15px] font-semibold leading-tight">
              Payment reminder from {reminder.senderName}
            </p>
            <p className="mt-1 text-[13px] leading-snug text-white/85 line-clamp-3">
              {previewLine}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded "tapped" view */}
      <div className="relative z-10 flex-1 overflow-y-auto mt-6 rounded-t-3xl bg-white text-foreground">
        <div className="px-5 pt-5 pb-8">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full bg-muted shrink-0">
              {host?.avatar && (
                <Image
                  src={host.avatar}
                  alt={host.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">From your host</p>
              <p className="font-semibold truncate">{reminder.senderName}</p>
            </div>
            <Badge className="ml-auto bg-primary/10 text-primary border-primary/15 gap-1 shrink-0">
              <Bell className="h-3 w-3" />
              Push
            </Badge>
          </div>

          {tripTitle && (
            <p className="mt-4 text-[11px] uppercase font-semibold tracking-wider text-muted-foreground">
              About your trip
            </p>
          )}
          {tripTitle && (
            <p className="mt-0.5 text-sm font-semibold">{tripTitle}</p>
          )}

          <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
            {body}
          </pre>

          {typeof amountDue === "number" && amountDue > 0 && (
            <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Balance remaining
                  </p>
                  <p className="text-xl font-bold">{formatMoney(amountDue)}</p>
                </div>
              </div>
              <Button className="mt-3 w-full gap-1.5" size="lg">
                <Wallet className="h-4 w-4" />
                Pay balance now
              </Button>
              <p className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure payment via Stripe
              </p>
            </div>
          )}

          <p className="mt-6 text-[11px] text-muted-foreground">
            Delivered to your Pack &amp; Pally app ·{" "}
            {sentTime.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
