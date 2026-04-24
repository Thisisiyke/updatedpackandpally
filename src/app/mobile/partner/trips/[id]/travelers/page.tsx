"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Users,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Send,
  Bell,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { PartnerTripTabs } from "@/components/mobile/partner-trip-tabs";
import { SendReminderSheet } from "@/components/partner/send-reminder-sheet";
import { partnerTrips } from "@/data/partner-trips";
import { getUserPartnerTrips } from "@/lib/user-partner-trips";
import {
  getBookingsForTrip,
  getTripPaymentStats,
  type PartnerBooking,
} from "@/lib/partner-bookings";
import {
  getRemindersForTrip,
  subscribeToReminders,
  type ReminderRecord,
  type ReminderChannel,
} from "@/data/reminders";
import {
  getOrCreatePartnerTripGroupChat,
  logPartnerTripSystemMessage,
} from "@/hooks/use-conversations";
import { CURRENT_PARTNER } from "@/data/conversations";
import { cn } from "@/lib/utils";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function relativeFromNow(iso?: string): string {
  if (!iso) return "";
  const days = Math.round((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60_000));
  if (days < 0) return `${Math.abs(days)}d ago`;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days}d`;
}

type FilterKey = "all" | "full" | "partial";

export default function MobilePartnerTravelersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const trip = useMemo(() => {
    const userTrips = getUserPartnerTrips();
    return (
      userTrips.find((t) => t.id === id) ||
      partnerTrips.find((t) => t.id === id) ||
      null
    );
  }, [id]);

  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [reminderOpen, setReminderOpen] = useState(false);
  const [prefocus, setPrefocus] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setBookings(getBookingsForTrip(id));
    setReminders(getRemindersForTrip(id));
    return subscribeToReminders(() => setReminders(getRemindersForTrip(id)));
  }, [id]);

  const stats = useMemo(() => getTripPaymentStats(bookings), [bookings]);
  const partials = useMemo(
    () => bookings.filter((b) => b.paymentMode === "partial"),
    [bookings]
  );
  const fulls = useMemo(
    () => bookings.filter((b) => b.paymentMode === "full"),
    [bookings]
  );
  const filtered =
    filter === "partial" ? partials : filter === "full" ? fulls : bookings;

  if (!trip) {
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-white">
        <MobileHeader title="Travelers" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <p className="font-semibold">Trip not found</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/mobile/partner")}
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSent = (count: number, channel: ReminderChannel) => {
    const label =
      channel === "email" ? "email" : channel === "sms" ? "SMS" : "push";
    const channelWord =
      channel === "email" ? "email" : channel === "sms" ? "text" : "app push";
    setToast(
      `${count} ${label} reminder${count === 1 ? "" : "s"} sent`
    );
    logPartnerTripSystemMessage(
      id,
      trip.title,
      `📣 Sent a ${channelWord} payment reminder to ${count} traveler${
        count === 1 ? "" : "s"
      }.`
    );
    setTimeout(() => setToast(null), 2400);
    setBookings(getBookingsForTrip(id));
  };

  const handleOpenGroupChat = () => {
    const convId = getOrCreatePartnerTripGroupChat(
      {
        id: trip.id,
        title: trip.title,
        coverImage: trip.coverImage,
      },
      bookings.map((b) => ({ bookingId: b.bookingId, contact: b.contact }))
    );
    if (convId) {
      router.push(`/mobile/partner/messages/${convId}`);
    }
  };

  return (
    <div className="relative flex flex-col h-full min-h-[844px] bg-muted/20">
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg animate-[fade-in-up_300ms_ease-out]">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      <MobileHeader
        title="Travelers"
        onBack={() => router.push(`/mobile/partner/trips/${id}`)}
      />
      <PartnerTripTabs tripId={id} />

      <div className="flex-1 overflow-y-auto pb-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 p-4 bg-white border-b">
          <Stat
            icon={<Users className="h-3 w-3 text-primary" />}
            label="Travelers"
            value={String(stats.totalTravelers)}
            sub={`of ${trip.maxGroupSize} spots`}
          />
          <Stat
            icon={<Wallet className="h-3 w-3 text-primary" />}
            label="Collected"
            value={formatMoney(stats.totalCollected)}
          />
          <Stat
            icon={<AlertTriangle className="h-3 w-3 text-amber-700" />}
            label="Outstanding"
            value={formatMoney(stats.totalOutstanding)}
            valueClass="text-amber-700"
            sub={`${stats.partialCount} partial`}
          />
          <Stat
            icon={<CheckCircle2 className="h-3 w-3 text-emerald-700" />}
            label="Fully paid"
            value={String(stats.fullyPaidCount)}
            valueClass="text-emerald-700"
            sub={`of ${stats.totalBookings}`}
          />
        </div>

        {/* Action row */}
        <div className="p-4 bg-white border-b space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenGroupChat}
              disabled={bookings.length === 0}
              className="gap-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Message group
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setPrefocus(null);
                setReminderOpen(true);
              }}
              disabled={partials.length === 0}
              className="gap-1.5"
            >
              <Bell className="h-3.5 w-3.5" />
              Send reminder
            </Button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="px-4 pt-3 pb-2 bg-white">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(
              [
                { k: "all", l: `All (${bookings.length})` },
                { k: "full", l: `Paid (${fulls.length})` },
                {
                  k: "partial",
                  l: `Partial (${partials.length})`,
                },
              ] as const
            ).map((t) => (
              <button
                key={t.k}
                type="button"
                onClick={() => setFilter(t.k)}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors",
                  filter === t.k
                    ? "bg-white shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {/* Travelers list */}
        <div className="px-4 pt-2">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-center text-xs text-muted-foreground">
              {filter === "partial"
                ? "No partial payments — everyone&apos;s all paid up."
                : filter === "full"
                ? "No fully paid bookings yet."
                : "No bookings on this trip yet."}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((b) => {
                const isPartial = b.paymentMode === "partial";
                return (
                  <div
                    key={b.bookingId}
                    className="rounded-2xl border bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-sm">
                            {b.contact.firstName} {b.contact.lastName}
                          </p>
                          {isPartial ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[9px]">
                              Deposit only
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[9px]">
                              Paid
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-2.5 w-2.5" />
                          {b.contact.email}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" />
                          {b.contact.phone}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          Paid{" "}
                          <span className="font-semibold text-foreground">
                            {formatMoney(b.amountPaidNow)}
                          </span>{" "}
                          of {formatMoney(b.totalPrice)}
                        </p>
                        {isPartial && (
                          <p className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {formatMoney(b.amountDueLater)} due{" "}
                            {relativeFromNow(b.paymentDueAt)}
                          </p>
                        )}
                      </div>
                      {isPartial && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 shrink-0"
                          onClick={() => {
                            setPrefocus(b.bookingId);
                            setReminderOpen(true);
                          }}
                        >
                          <Send className="h-3 w-3" />
                          Remind
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reminder history */}
        <div className="px-4 mt-6">
          <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Reminder history
            {reminders.length > 0 && (
              <Badge variant="secondary" className="text-[9px]">
                {reminders.length}
              </Badge>
            )}
          </h2>
          {reminders.length === 0 ? (
            <div className="rounded-2xl border bg-white p-5 text-center text-xs text-muted-foreground">
              No reminders sent yet.
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.map((r) => {
                const channelLabel =
                  r.channel === "email"
                    ? "Email"
                    : r.channel === "sms"
                    ? "SMS"
                    : "App push";
                const ChannelIcon =
                  r.channel === "email"
                    ? Mail
                    : r.channel === "sms"
                    ? MessageSquare
                    : Bell;
                return (
                  <div
                    key={r.id}
                    className="rounded-2xl border bg-white p-3"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        className={cn(
                          "gap-1 text-[9px]",
                          r.channel === "email"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : r.channel === "sms"
                            ? "bg-violet-100 text-violet-800 border-violet-200"
                            : "bg-primary/10 text-primary border-primary/20"
                        )}
                      >
                        <ChannelIcon className="h-2.5 w-2.5" />
                        {channelLabel}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(r.sentAt)} ·{" "}
                        {r.recipientBookingIds.length} recipient
                        {r.recipientBookingIds.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {r.subject && (
                      <p className="mt-1.5 text-xs font-semibold">
                        {r.subject}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {r.body}
                    </p>
                    <Separator className="my-2" />
                    <p className="text-[10px] text-muted-foreground">
                      To: {r.recipientNames.join(", ")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SendReminderSheet
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        tripId={id}
        tripTitle={trip.title}
        hostName={CURRENT_PARTNER.name}
        partialBookings={partials}
        prefocusBookingId={prefocus}
        onSent={handleSent}
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-2.5">
      <div className="flex items-center gap-1">
        {icon}
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </p>
      </div>
      <p className={cn("mt-0.5 text-base font-bold leading-tight", valueClass)}>
        {value}
      </p>
      {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
