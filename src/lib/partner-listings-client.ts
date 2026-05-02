import type { PartnerListing } from "@/data/partner-listings";
import { wanderlyListingToPartnerListing } from "@/lib/wanderly-listing-map";

type ApiSuccess<T> = { status: "success" } & T;
type ApiErr = { status?: string; message?: string };

async function parseJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function fetchPartnerListingsList(params?: {
  limit?: number;
  lastKey?: string | null;
}): Promise<{ listings: PartnerListing[]; lastKey: string | null }> {
  const q = new URLSearchParams();
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.lastKey) q.set("lastKey", params.lastKey);
  const url = q.toString()
    ? `/api/partner/listings?${q.toString()}`
    : "/api/partner/listings";
  const res = await fetch(url, { credentials: "include" });
  const data = (await parseJson(res)) as ApiSuccess<{ items?: unknown[]; lastKey?: string | null }> &
    ApiErr;
  if (!res.ok || data.status !== "success") {
    throw new Error(data.message || "Could not load listings");
  }
  const items = (data.items || []).map((row) =>
    wanderlyListingToPartnerListing(row as Record<string, unknown>)
  );
  return { listings: items, lastKey: data.lastKey ?? null };
}

export async function fetchPartnerListing(id: string): Promise<PartnerListing> {
  const res = await fetch(`/api/partner/listings/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  const data = (await parseJson(res)) as ApiSuccess<{ listing?: unknown }> & ApiErr;
  if (!res.ok || data.status !== "success" || !data.listing) {
    throw new Error(data.message || "Could not load listing");
  }
  return wanderlyListingToPartnerListing(data.listing as Record<string, unknown>);
}

/** Raw Dynamo-shaped listing (for duplicate). */
export async function fetchPartnerListingRecord(id: string): Promise<Record<string, unknown>> {
  const res = await fetch(`/api/partner/listings/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  const data = (await parseJson(res)) as ApiSuccess<{ listing?: unknown }> & ApiErr;
  if (!res.ok || data.status !== "success" || !data.listing) {
    throw new Error(data.message || "Could not load listing");
  }
  return data.listing as Record<string, unknown>;
}

export async function createPartnerListing(
  body: Record<string, unknown>
): Promise<PartnerListing> {
  const res = await fetch("/api/partner/listings", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await parseJson(res)) as ApiSuccess<{ listing?: unknown }> & ApiErr;
  if (!res.ok || data.status !== "success" || !data.listing) {
    throw new Error(data.message || "Could not create listing");
  }
  return wanderlyListingToPartnerListing(data.listing as Record<string, unknown>);
}

export async function updatePartnerListing(
  id: string,
  body: Record<string, unknown>
): Promise<PartnerListing> {
  const res = await fetch(`/api/partner/listings/${encodeURIComponent(id)}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await parseJson(res)) as ApiSuccess<{ listing?: unknown }> & ApiErr;
  if (!res.ok || data.status !== "success" || !data.listing) {
    throw new Error(data.message || "Could not save listing");
  }
  return wanderlyListingToPartnerListing(data.listing as Record<string, unknown>);
}

export async function patchPartnerListingStatus(
  id: string,
  status: PartnerListing["status"]
): Promise<PartnerListing> {
  const res = await fetch(`/api/partner/listings/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = (await parseJson(res)) as ApiSuccess<{ listing?: unknown }> & ApiErr;
  if (!res.ok || data.status !== "success" || !data.listing) {
    throw new Error(data.message || "Could not update status");
  }
  return wanderlyListingToPartnerListing(data.listing as Record<string, unknown>);
}

export async function deletePartnerListing(id: string): Promise<void> {
  const res = await fetch(`/api/partner/listings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = (await parseJson(res)) as ApiSuccess<unknown> & ApiErr;
  if (!res.ok || data.status !== "success") {
    throw new Error(data.message || "Could not delete listing");
  }
}

/** Duplicate via raw Dynamo fields from GET (same shape POST /listings/create expects). */
export async function duplicatePartnerListingFromRaw(raw: Record<string, unknown>): Promise<PartnerListing> {
  const body = {
    type: raw.type,
    name: `${String(raw.name ?? "Listing")} (copy)`,
    description: raw.description ?? "",
    address: raw.address ?? "",
    city: raw.city ?? "",
    country: raw.country ?? "",
    currency: raw.currency ?? "USD",
    coverImage: raw.coverImage ?? "",
    images: raw.images,
    pricePerNight: raw.pricePerNight ?? 0,
    starRating: raw.starRating ?? 3,
    totalRooms: raw.totalRooms ?? 1,
    availableRooms: raw.availableRooms ?? raw.totalRooms ?? 1,
    amenities: raw.amenities ?? [],
    status: "draft",
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    occupancyRate: raw.occupancyRate ?? 0,
    monthlyRevenue: raw.monthlyRevenue ?? 0,
  };
  return createPartnerListing(body);
}
