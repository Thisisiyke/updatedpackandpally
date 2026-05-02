"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Star,
  MapPin,
  MoreVertical,
  Pencil,
  Eye,
  Pause,
  Play,
  Copy,
  Trash2,
  Building2,
  Loader2,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PartnerListing } from "@/data/partner-listings";
import {
  deletePartnerListing,
  duplicatePartnerListingFromRaw,
  fetchPartnerListingRecord,
  fetchPartnerListingsList,
  patchPartnerListingStatus,
} from "@/lib/partner-listings-client";
import { hostNeedsStripeConnect } from "@/lib/host-needs-stripe-connect";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case "published":
      return {
        label: "Published",
        class: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "draft":
      return {
        label: "Draft",
        class: "bg-gray-100 text-gray-700 border-gray-200",
      };
    case "paused":
      return {
        label: "Paused",
        class: "bg-amber-100 text-amber-800 border-amber-200",
      };
    default:
      return { label: status, class: "" };
  }
}

export default function PartnerListingsPage() {
  const router = useRouter();
  const { user } = usePackPallyAuth();
  const needsStripe = hostNeedsStripeConnect(user);
  const [partnerListings, setPartnerListings] = useState<PartnerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { listings } = await fetchPartnerListingsList({ limit: 50 });
      setPartnerListings(listings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load listings");
      setPartnerListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = partnerListings.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (
      search &&
      !l.name.toLowerCase().includes(search.toLowerCase()) &&
      !l.city.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const counts = {
    all: partnerListings.length,
    published: partnerListings.filter((l) => l.status === "published").length,
    draft: partnerListings.filter((l) => l.status === "draft").length,
    paused: partnerListings.filter((l) => l.status === "paused").length,
  };

  async function handleDuplicate(listing: PartnerListing) {
    setBusyId(listing.id);
    setError(null);
    try {
      const raw = await fetchPartnerListingRecord(listing.id);
      const created = await duplicatePartnerListingFromRaw(raw);
      await load();
      router.push(`/partner/listings/${created.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Duplicate failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handlePauseToggle(listing: PartnerListing) {
    setBusyId(listing.id);
    setError(null);
    try {
      const next =
        listing.status === "paused" ? "published" : "paused";
      await patchPartnerListingStatus(listing.id, next);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update status");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(listing: PartnerListing) {
    if (
      !window.confirm(
        `Delete “${listing.name}”? This cannot be undone.`
      )
    )
      return;
    setBusyId(listing.id);
    setError(null);
    try {
      await deletePartnerListing(listing.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Listings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your properties and rooms
          </p>
        </div>
        {needsStripe ? (
          <Button
            asChild
            variant="outline"
            className="gap-1.5 shrink-0 border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100"
          >
            <Link href="/partner/onboarding/stripe">
              <CreditCard className="h-4 w-4" />
              Connect Stripe to add listings
            </Link>
          </Button>
        ) : (
          <Button asChild className="gap-1.5 shrink-0">
            <Link href="/partner/listings/new">
              <Plus className="h-4 w-4" />
              Add Listing
            </Link>
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 rounded-lg border bg-white p-1 overflow-x-auto">
          {[
            { value: "all", label: "All" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Drafts" },
            { value: "paused", label: "Paused" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === tab.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label} ({counts[tab.value as keyof typeof counts]})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading listings…
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((listing) => {
            const statusConfig = getStatusConfig(listing.status);
            const working = busyId === listing.id;
            const pauseLabel =
              listing.status === "paused" ? "Resume" : "Pause";

            return (
              <div
                key={listing.id}
                className="group rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={listing.coverImage}
                    alt={listing.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <Badge
                    className={cn("absolute top-3 left-3", statusConfig.class)}
                  >
                    {statusConfig.label}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      disabled={working}
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white outline-none"
                    >
                      {working ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/partner/listings/${listing.id}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/partner/listings/${listing.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={working}
                        onClick={() => void handleDuplicate(listing)}
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={working || listing.status === "draft"}
                        onClick={() => void handlePauseToggle(listing)}
                      >
                        {listing.status === "paused" ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <Pause className="h-4 w-4" />
                        )}
                        {pauseLabel}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={working}
                        onClick={() => void handleDelete(listing)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: listing.starRating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <h3 className="font-bold leading-tight line-clamp-1">
                    {listing.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {listing.city}, {listing.country}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Occupancy</p>
                      <p className="font-bold">{listing.occupancyRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rooms</p>
                      <p className="font-bold">
                        {listing.totalRooms - listing.availableRooms}/
                        {listing.totalRooms}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-bold">
                        {listing.monthlyRevenue >= 1000
                          ? `$${Math.round(listing.monthlyRevenue / 1000)}k`
                          : `$${listing.monthlyRevenue}`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Base price
                      </p>
                      <p className="font-bold">
                        {formatMoney(listing.pricePerNight, listing.currency)}
                        <span className="text-xs font-normal text-muted-foreground">
                          /night
                        </span>
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/partner/listings/${listing.id}`}>
                        Manage
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-bold mb-1">No listings found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {search
              ? "Try adjusting your search or filters"
              : "Start by adding your first property"}
          </p>
          {needsStripe ? (
            <Button
              asChild
              variant="outline"
              className="gap-1.5 border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100"
            >
              <Link href="/partner/onboarding/stripe">
                <CreditCard className="h-4 w-4" />
                Connect Stripe first
              </Link>
            </Button>
          ) : (
            <Button asChild className="gap-1.5">
              <Link href="/partner/listings/new">
                <Plus className="h-4 w-4" />
                Add Listing
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
