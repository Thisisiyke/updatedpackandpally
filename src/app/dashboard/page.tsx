"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { isPackPallyHostUser } from "@/lib/host-access";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Plane,
  Settings,
  User,
  CreditCard,
  Globe,
  Star,
  Clock,
  ChevronRight,
  TrendingUp,
  Eye,
  Pencil,
  MessageCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Container } from "@/components/shared/container";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { InlineMessages } from "@/components/shared/inline-messages";
import { useTravelerMessagesApi } from "@/hooks/use-traveler-messages-api";
import type { TravelerDashboardBooking } from "@/lib/wanderly-traveler-bookings";
import { cn } from "@/lib/utils";
import { DashboardDiscoverTrips } from "@/components/dashboard/dashboard-discover-trips";
import { TravelerProfilePanel } from "@/components/dashboard/traveler-profile-panel";
import { wanderlyHostTripToPartnerTrip } from "@/lib/wanderly-partner-map";
import type { WanderlyTripRecord } from "@/lib/wanderly-trip-adapter";
import type { PartnerTrip } from "@/data/partner-trips";

const sidebarLinks = [
  { label: "Overview", icon: TrendingUp, id: "overview" },
  { label: "My Bookings", icon: Plane, id: "bookings" },
  { label: "Messages", icon: MessageCircle, id: "messages" },
  { label: "Manage Trips", icon: MapPin, id: "manage" },
  { label: "Profile", icon: User, id: "profile" },
  { label: "Settings", icon: Settings, id: "settings" },
];

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "completed":
      return "bg-slate-100 text-slate-800 border-slate-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatBookingStatusLabel(status: TravelerDashboardBooking["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function hostTripBadgeConfig(status: PartnerTrip["status"]) {
  switch (status) {
    case "draft":
      return { label: "Draft", className: "bg-gray-100 text-gray-800 border-gray-200" };
    case "sold-out":
      return { label: "Sold out", className: "bg-amber-100 text-amber-800 border-amber-200" };
    case "published":
    default:
      return { label: "Live", className: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  }
}

export default function DashboardPage() {
  const { user: packUser, loading: authLoading, refresh: refreshAuth } =
    usePackPallyAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [myBookings, setMyBookings] = useState<TravelerDashboardBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [hostTrips, setHostTrips] = useState<PartnerTrip[] | null>(null);
  const [hostTripsLoading, setHostTripsLoading] = useState(false);
  const [hostTripsError, setHostTripsError] = useState(false);

  const travelerInboxEnabled =
    Boolean(packUser?.id) && packUser?.role !== "guest";
  const travelerInbox = useTravelerMessagesApi(travelerInboxEnabled);
  const messageUnread = travelerInbox.totalUnread;
  const messageConversationsCount = travelerInbox.conversations.length;

  useEffect(() => {
    if (!packUser || packUser.role === "guest") {
      setMyBookings([]);
      setBookingsLoading(false);
      return;
    }
    let cancelled = false;
    setBookingsLoading(true);
    fetch("/api/me/bookings", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return [];
        const d = (await r.json()) as { bookings?: TravelerDashboardBooking[] };
        return Array.isArray(d.bookings) ? d.bookings : [];
      })
      .then((list) => {
        if (!cancelled) setMyBookings(list);
      })
      .catch(() => {
        if (!cancelled) setMyBookings([]);
      })
      .finally(() => {
        if (!cancelled) setBookingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [packUser]);

  useEffect(() => {
    if (activeTab !== "manage" || !packUser?.id) return;
    let cancelled = false;
    setHostTripsLoading(true);
    setHostTripsError(false);
    fetch(
      `/api/partner/trips?userId=${encodeURIComponent(packUser.id)}&limit=50`,
      { credentials: "include" }
    )
      .then(async (r) => {
        if (!r.ok) throw new Error("bad status");
        return r.json() as Promise<{ items?: WanderlyTripRecord[] }>;
      })
      .then((d) => {
        if (cancelled) return;
        if (!Array.isArray(d.items)) {
          setHostTrips([]);
          return;
        }
        setHostTrips(d.items.map((row) => wanderlyHostTripToPartnerTrip(row)));
      })
      .catch(() => {
        if (!cancelled) {
          setHostTripsError(true);
          setHostTrips(null);
        }
      })
      .finally(() => {
        if (!cancelled) setHostTripsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, packUser?.id]);

  const activeBookings = myBookings.filter((b) => b.status !== "cancelled");
  const upcomingTrips = activeBookings.filter((b) => b.status !== "completed");
  const totalSpent = activeBookings.reduce((s, b) => s + b.totalPrice, 0);

  if (authLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-muted/30 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </section>
    );
  }

  if (!packUser) {
    redirect("/login");
  }

  const userName = packUser.name || "Traveler";
  const userEmail = packUser.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <Container className="py-8 lg:py-10">
        {/* Welcome header */}
        <ScrollReveal>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10">
                {packUser.image ? (
                  <Image
                    src={packUser.image}
                    alt="User"
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xl font-bold text-primary">
                    {userInitial}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome back, {userName.split(" ")[0]}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Ready for your next adventure?
                </p>
              </div>
            </div>
            {isPackPallyHostUser(packUser) ? (
              <Button className="gap-1.5 self-start" asChild>
                <Link href="/partner">
                  <MapPin className="h-4 w-4" />
                  Partner Portal
                </Link>
              </Button>
            ) : (
              <Button className="gap-1.5 self-start" asChild>
                <Link href="/browse-trips">
                  <Globe className="h-4 w-4" />
                  Explore Trips
                </Link>
              </Button>
            )}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <ScrollReveal direction="left" distance={30}>
            <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {sidebarLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={cn(
                    "flex items-center justify-between gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                    activeTab === link.id
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <link.icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </span>
                  {link.id === "messages" &&
                    travelerInbox.hydrated &&
                    messageUnread > 0 && (
                      <span
                        className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground"
                        aria-label={`${messageUnread} unread messages`}
                      >
                        {messageUnread > 99 ? "99+" : messageUnread}
                      </span>
                    )}
                </button>
              ))}
            </nav>
          </ScrollReveal>

          {/* Main content */}
          <div className="min-w-0">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                {/* <ScrollReveal>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: "Upcoming Trips",
                        value: String(upcomingTrips.length),
                        icon: Plane,
                        color: "text-primary",
                        bg: "bg-primary/10",
                      },
                      {
                        label: "Countries Visited",
                        value: "3",
                        icon: Globe,
                        color: "text-emerald-600",
                        bg: "bg-emerald-50",
                      },
                      {
                        label: "Total Spent",
                        value: `$${totalSpent.toLocaleString()}`,
                        icon: CreditCard,
                        color: "text-amber-600",
                        bg: "bg-amber-50",
                      },
                      {
                        label: "Reviews Given",
                        value: "5",
                        icon: Star,
                        color: "text-violet-600",
                        bg: "bg-violet-50",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border bg-white p-5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {stat.label}
                          </span>
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}
                          >
                            <stat.icon
                              className={`h-4 w-4 ${stat.color}`}
                            />
                          </div>
                        </div>
                        <p className="mt-3 text-2xl font-bold">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </ScrollReveal> */}

                <ScrollReveal delay={80}>
                  <DashboardDiscoverTrips enabled={activeTab === "overview"} />
                </ScrollReveal>

                {/* Upcoming Trips */}
                <ScrollReveal delay={100}>
                  <div className="rounded-xl border bg-white">
                    <div className="flex items-center justify-between p-5 pb-0">
                      <h2 className="text-lg font-bold">Upcoming Trips</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-muted-foreground"
                        onClick={() => setActiveTab("bookings")}
                      >
                        View all
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="p-5 space-y-4">
                      {bookingsLoading ? (
                        <p className="text-sm text-muted-foreground py-4">
                          Loading bookings…
                        </p>
                      ) : upcomingTrips.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">
                          No active bookings yet.{" "}
                          <Link
                            href="/browse-trips"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            Browse trips
                          </Link>
                        </p>
                      ) : (
                        upcomingTrips.slice(0, 2).map((booking) => {
                          const start = new Date(
                            booking.startDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                          const end = new Date(
                            booking.endDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });

                          return (
                            <Link
                              href={`/trips/${booking.tripRouteId}`}
                              key={booking.id}
                              className="flex items-center gap-4 rounded-lg border p-3 transition-all hover:shadow-sm hover:border-primary/20"
                            >
                              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                                <Image
                                  src={booking.coverImage}
                                  alt={booking.tripTitle}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                  unoptimized
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate">
                                  {booking.tripTitle}
                                </h3>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {start} — {end}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {booking.travelers}
                                  </span>
                                </div>
                              </div>
                              <Badge
                                className={`shrink-0 text-xs ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {formatBookingStatusLabel(booking.status)}
                              </Badge>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                {/* Quick Actions */}
                <ScrollReveal delay={200}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Link
                      href="/browse-trips"
                      className="flex items-center gap-4 rounded-xl border bg-white p-5 transition-all hover:shadow-md hover:border-primary/20"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Browse Trips</p>
                        <p className="text-xs text-muted-foreground">
                          Find your next adventure
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/ai-features"
                      className="flex items-center gap-4 rounded-xl border bg-white p-5 transition-all hover:shadow-md hover:border-primary/20"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                        <Star className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">AI Tools</p>
                        <p className="text-xs text-muted-foreground">
                          Generate trips & packing lists
                        </p>
                      </div>
                    </Link>
                    {isPackPallyHostUser(packUser) ? (
                      <Link
                        href="/partner"
                        className="flex items-center gap-4 rounded-xl border bg-white p-5 transition-all hover:shadow-md hover:border-primary/20"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                          <MapPin className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Partner Portal</p>
                          <p className="text-xs text-muted-foreground">
                            Manage your listings
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <Link
                        href="/become-a-host"
                        className="flex items-center gap-4 rounded-xl border bg-white p-5 transition-all hover:shadow-md hover:border-primary/20"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                          <MapPin className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Start Hosting</p>
                          <p className="text-xs text-muted-foreground">
                            Lead your own trips
                          </p>
                        </div>
                      </Link>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <ScrollReveal>
                <div className="rounded-xl border bg-white">
                  <div className="p-5 pb-0">
                    <h2 className="text-lg font-bold">My Bookings</h2>
                    <p className="text-sm text-muted-foreground">
                      All your trip reservations
                    </p>
                  </div>
                  <div className="p-5 space-y-4">
                    {bookingsLoading ? (
                      <p className="text-sm text-muted-foreground">
                        Loading bookings…
                      </p>
                    ) : myBookings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        You don&apos;t have any reservations yet.{" "}
                        <Link
                          href="/browse-trips"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          Find a trip
                        </Link>
                      </p>
                    ) : (
                      myBookings.map((booking) => {
                        const startDate = new Date(
                          booking.startDate
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });

                        return (
                          <div
                            key={booking.id}
                            className="flex flex-col gap-4 rounded-xl border p-4 transition-all hover:shadow-sm sm:flex-row sm:items-center"
                          >
                            <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-32">
                              <Image
                                src={booking.coverImage}
                                alt={booking.tripTitle}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, 128px"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-bold truncate">
                                    {booking.tripTitle}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {booking.destination}
                                  </p>
                                </div>
                                <Badge
                                  className={`shrink-0 ${getStatusColor(
                                    booking.status
                                  )}`}
                                >
                                  {formatBookingStatusLabel(booking.status)}
                                </Badge>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {startDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {booking.travelers} traveler
                                  {booking.travelers > 1 ? "s" : ""}
                                </span>
                                <span className="font-semibold text-foreground">
                                  ${booking.totalPrice.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="shrink-0"
                            >
                              <Link
                                href={`/trips/${booking.tripRouteId}`}
                              >
                                View Trip
                              </Link>
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <ScrollReveal>
                <div>
                  <div className="mb-4">
                    <h2 className="text-lg font-bold">Messages</h2>
                    <p className="text-sm text-muted-foreground">
                      {travelerInboxEnabled ? (
                        travelerInbox.hydrated ? (
                          messageConversationsCount === 0 ? (
                            "No conversations yet. Book a trip to start chatting."
                          ) : messageUnread > 0 ? (
                            `${messageConversationsCount} conversation${messageConversationsCount === 1 ? "" : "s"} · ${messageUnread} unread`
                          ) : (
                            `${messageConversationsCount} conversation${messageConversationsCount === 1 ? "" : "s"}`
                          )
                        ) : (
                          "Loading conversations…"
                        )
                      ) : (
                        "Chat with your hosts and partners"
                      )}
                    </p>
                  </div>
                  <InlineMessages
                    side="user"
                    sharedTravelerInbox={
                      travelerInboxEnabled ? travelerInbox : undefined
                    }
                  />
                </div>
              </ScrollReveal>
            )}

            {/* Manage Trips Tab */}
            {activeTab === "manage" && (
              <ScrollReveal>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">Your Hosted Trips</h2>
                      <p className="text-sm text-muted-foreground">
                        Create and manage your group adventures
                      </p>
                    </div>
                    <Button asChild className="gap-1.5">
                      <Link href="/partner/trips/new">
                        <Plus className="h-4 w-4" />
                        Create Trip
                      </Link>
                    </Button>
                  </div>

                  {hostTripsLoading && (
                    <p className="text-sm text-muted-foreground">Loading your trips…</p>
                  )}
                  {hostTripsError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      Could not load your trips. Try again in a moment.
                    </div>
                  )}
                  {!hostTripsLoading && !hostTripsError && hostTrips && hostTrips.length === 0 && (
                    <div className="rounded-xl border bg-white p-8 text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        You have no published trips yet. Create one to see it here.
                      </p>
                      <Button asChild className="gap-1.5">
                        <Link href="/partner/trips/new">
                          <Plus className="h-4 w-4" />
                          Create trip
                        </Link>
                      </Button>
                    </div>
                  )}
                  {!hostTripsLoading && !hostTripsError && hostTrips && hostTrips.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {hostTrips.map((trip) => {
                        const fill =
                          trip.maxGroupSize > 0
                            ? (trip.currentBookings / trip.maxGroupSize) * 100
                            : 0;
                        const badge = hostTripBadgeConfig(trip.status);
                        return (
                          <div
                            key={trip.id}
                            className="overflow-hidden rounded-xl border bg-white transition-all hover:shadow-md"
                          >
                            <div className="relative h-36">
                              <Image
                                src={trip.coverImage}
                                alt={trip.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                              <Badge
                                className={cn(
                                  "absolute top-3 left-3 text-xs border",
                                  badge.className
                                )}
                              >
                                {badge.label}
                              </Badge>
                            </div>
                            <div className="p-4">
                              <h3 className="font-bold truncate text-sm">
                                {trip.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {trip.destination}
                                {trip.country ? `, ${trip.country}` : ""}
                              </p>

                              <div className="mt-3 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    Bookings
                                  </span>
                                  <span className="font-medium">
                                    {trip.currentBookings}/{trip.maxGroupSize}
                                  </span>
                                </div>
                                <Progress value={fill} className="h-1.5" />
                              </div>

                              <Separator className="my-3" />

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 gap-1 text-xs h-8"
                                  asChild
                                >
                                  <Link href={`/partner/trips/${trip.id}`}>
                                    <Pencil className="h-3 w-3" />
                                    Edit
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 gap-1 text-xs h-8"
                                  asChild
                                >
                                  <Link href={`/trips/${trip.id}`}>
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <ScrollReveal>
                <TravelerProfilePanel
                  packUser={packUser}
                  refreshAuth={refreshAuth}
                  myBookings={myBookings}
                />
              </ScrollReveal>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <ScrollReveal>
                <div className="rounded-xl border bg-white p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold">Settings</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your account preferences
                    </p>
                  </div>

                  <Separator />

                  {[
                    {
                      title: "Email Notifications",
                      desc: "Receive updates about trips and bookings",
                    },
                    {
                      title: "Marketing Emails",
                      desc: "Get notified about new destinations and offers",
                    },
                    {
                      title: "Two-Factor Authentication",
                      desc: "Add an extra layer of security to your account",
                    },
                    {
                      title: "Data Privacy",
                      desc: "Control how your data is used",
                    },
                  ].map((setting, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{setting.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {setting.desc}
                        </p>
                      </div>
                      <div className="h-6 w-11 rounded-full bg-primary/20 relative cursor-pointer">
                        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform" />
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
