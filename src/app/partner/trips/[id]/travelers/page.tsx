"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Users,
  Wallet,
  AlertTriangle,
  Send,
  Bell,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  MessageSquare,
  Bell as BellIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SendReminderSheet } from "@/components/partner/send-reminder-sheet";
import { partnerTrips } from "@/data/partner-trips";
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
    year: "numeric",
  });
}

function relativeFromNow(iso?: string): string {
  if (!iso) return "";
  const diffMs = new Date(iso).getTime() - Date.now();
  const days = Math.round(diffMs / (24 * 60 * 60_000));
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

type FilterKey = "all" | "full" | "partial";

export default function TripTravelersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const trip = partnerTrips.find((t) => t.id === id);

  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [reminderOpen, setReminderOpen] = useState(false);
  const [prefocusBookingId, setPrefocusBookingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setBookings(getBookingsForTrip(id));
    setReminders(getRemindersForTrip(id));
    const refresh = () => setReminders(getRemindersForTrip(id));
    return subscribeToReminders(refresh);
  }, [id]);

  const stats = useMemo(() => getTripPaymentStats(bookings), [bookings]);
  const partialBookings = useMemo(
    () => bookings.filter((b) => b.paymentMode === "partial"),
    [bookings]
  );
  const fullBookings = useMemo(
    () => bookings.filter((b) => b.paymentMode === "full"),
    [bookings]
  );

  const filtered = useMemo(() => {
    if (filter === "full") return fullBookings;
    if (filter === "partial") return partialBookings;
    return bookings;
  }, [filter, bookings, fullBookings, partialBookings]);

  if (!trip) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Trip not found</h1>
        <Button asChild className="mt-6">
          <Link href="/partner/trips">Back to trips</Link>
        </Button>
      </div>
    );
  }

  const handleOpenAllReminders = () => {
    setPrefocusBookingId(null);
    setReminderOpen(true);
  };

  const handleRowRemind = (bookingId: string) => {
    setPrefocusBookingId(bookingId);
    setReminderOpen(true);
  };

  const handleSent = (count: number, channel: ReminderChannel) => {
    const label =
      channel === "email" ? "email" : channel === "sms" ? "SMS" : "push";
    setToast(
      `${count} ${label} reminder${count === 1 ? "" : "s"} sent`
    );
    // Log a system message into the partner trip group chat if one exists
    const channelWord =
      channel === "email" ? "email" : channel === "sms" ? "text" : "app push";
    logPartnerTripSystemMessage(
      id,
      trip.title,
      `📣 Sent a ${channelWord} payment reminder to ${count} traveler${
        count === 1 ? "" : "s"
      }.`
    );
    setTimeout(() => setToast(null), 2600);
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
      router.push(`/partner/messages/${convId}`);
    } else {
      router.push("/partner/messages");
    }
  };

  return (
    <div className="p-6 lg:p-10">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg animate-[fade-in-up_300ms_ease-out]">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0">
          <Link href={`/partner/trips/${id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {trip.title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)} ·{" "}
            {stats.totalTravelers} going
          </p>
        </div>
      </div>

      {/* Tabs for trip sub-sections */}
      <div className="mb-6 flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        <Link
          href={`/partner/trips/${id}`}
          className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Overview
        </Link>
        <span className="rounded-md bg-white px-4 py-1.5 text-sm font-semibold shadow-sm">
          Travelers
        </span>
        <Link
          href={`/partner/trips/${id}/surveys`}
          className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Surveys
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            Travelers
          </p>
          <p className="text-2xl font-bold mt-1">{stats.totalTravelers}</p>
          <p className="text-[11px] text-muted-foreground">
            of {trip.maxGroupSize} spots
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Wallet className="h-3 w-3" />
            Collected
          </p>
          <p className="text-2xl font-bold mt-1">
            {formatMoney(stats.totalCollected)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            across {stats.totalBookings} booking
            {stats.totalBookings === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Outstanding
          </p>
          <p className="text-2xl font-bold mt-1 text-amber-700">
            {formatMoney(stats.totalOutstanding)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {stats.partialCount} partial payment
            {stats.partialCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Fully paid
          </p>
          <p className="text-2xl font-bold mt-1 text-emerald-700">
            {stats.fullyPaidCount}
          </p>
          <p className="text-[11px] text-muted-foreground">
            of {stats.totalBookings} booking
            {stats.totalBookings === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
          {(
            [
              { k: "all", l: `All (${bookings.length})` },
              { k: "full", l: `Fully paid (${fullBookings.length})` },
              {
                k: "partial",
                l: `Partial (${partialBookings.length})`,
              },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => setFilter(t.k)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === t.k
                  ? "bg-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenGroupChat}
            className="gap-1.5"
            disabled={bookings.length === 0}
          >
            <MessageCircle className="h-4 w-4" />
            Message group
          </Button>
          <Button
            size="sm"
            onClick={handleOpenAllReminders}
            disabled={partialBookings.length === 0}
            className="gap-1.5"
          >
            <Bell className="h-4 w-4" />
            Send payment reminder
          </Button>
        </div>
      </div>

      {/* Travelers table */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {filter === "partial"
              ? "No partial payments — everyone's all paid up."
              : filter === "full"
              ? "No fully paid bookings yet."
              : "No bookings on this trip yet."}
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((b) => {
              const isPartial = b.paymentMode === "partial";
              return (
                <div
                  key={b.bookingId}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">
                        {b.contact.firstName} {b.contact.lastName}
                      </p>
                      {isPartial ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 text-[10px]">
                          Deposit only
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-[10px]">
                          Paid in full
                        </Badge>
                      )}
                      {b.source === "local" && (
                        <Badge variant="secondary" className="text-[10px]">
                          new
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {b.contact.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {b.contact.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {b.tripTravelers} traveler
                        {b.tripTravelers === 1 ? "" : "s"}
                      </span>
                      <span>Booked {formatDate(b.createdAt)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 min-w-[140px]">
                    <p className="text-xs text-muted-foreground">
                      Paid{" "}
                      <span className="font-semibold text-foreground">
                        {formatMoney(b.amountPaidNow)}
                      </span>{" "}
                      of {formatMoney(b.totalPrice)}
                    </p>
                    {isPartial && (
                      <p className="text-xs text-amber-700 font-semibold flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {formatMoney(b.amountDueLater)} due{" "}
                        {relativeFromNow(b.paymentDueAt)}
                      </p>
                    )}
                  </div>

                  {isPartial && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRowRemind(b.bookingId)}
                      className="gap-1.5 shrink-0"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Remind
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reminder history */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Reminder history
          {reminders.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {reminders.length}
            </Badge>
          )}
        </h2>

        {reminders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-sm text-muted-foreground">
            No reminders sent yet. Partial-payment travelers will see their
            messages in {CURRENT_PARTNER.name.split(" ")[0]}&apos;s voice.
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={cn(
                        "gap-1 text-[10px]",
                        r.channel === "email"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : r.channel === "sms"
                          ? "bg-violet-100 text-violet-800 border-violet-200"
                          : "bg-primary/10 text-primary border-primary/20"
                      )}
                    >
                      {r.channel === "email" ? (
                        <Mail className="h-3 w-3" />
                      ) : r.channel === "sms" ? (
                        <MessageSquare className="h-3 w-3" />
                      ) : (
                        <BellIcon className="h-3 w-3" />
                      )}
                      {r.channel === "email"
                        ? "Email"
                        : r.channel === "sms"
                        ? "SMS"
                        : "App push"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.sentAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {r.recipientBookingIds.length} recipient
                      {r.recipientBookingIds.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs h-7"
                    onClick={() => {
                      setPrefocusBookingId(null);
                      setReminderOpen(true);
                    }}
                  >
                    <Send className="h-3 w-3" />
                    Resend
                  </Button>
                </div>
                {r.subject && (
                  <p className="mt-2 text-sm font-semibold">{r.subject}</p>
                )}
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                  {r.body}
                </p>
                <Separator className="my-3" />
                <p className="text-[11px] text-muted-foreground">
                  Sent to: {r.recipientNames.join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <SendReminderSheet
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        tripId={id}
        tripTitle={trip.title}
        hostName={CURRENT_PARTNER.name}
        partialBookings={partialBookings}
        prefocusBookingId={prefocusBookingId}
        onSent={handleSent}
      />
    </div>
  );
}
