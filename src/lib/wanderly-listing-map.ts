import type { PartnerListing } from "@/data/partner-listings";

/** Dynamo `Wan-listings` item → UI model */
export function wanderlyListingToPartnerListing(row: Record<string, unknown>): PartnerListing {
  const created = Number(row.createdAt);
  const createdAt = Number.isFinite(created)
    ? new Date(created).toISOString().slice(0, 10)
    : "";

  const st = String(row.status ?? "draft").toLowerCase();
  const status: PartnerListing["status"] =
    st === "published" || st === "paused" || st === "draft" ? st : "draft";

  const ty = String(row.type ?? "hotel").toLowerCase();
  const type: PartnerListing["type"] =
    ty === "hotel" ||
    ty === "apartment" ||
    ty === "resort" ||
    ty === "villa" ||
    ty === "hostel"
      ? ty
      : "hotel";

  const imgs = Array.isArray(row.images)
    ? (row.images as unknown[]).map((u) => String(u)).filter(Boolean)
    : [];

  return {
    id: String(row._id ?? ""),
    name: String(row.name ?? ""),
    type,
    city: String(row.city ?? ""),
    country: String(row.country ?? ""),
    address: String(row.address ?? ""),
    starRating: Math.min(5, Math.max(1, Number(row.starRating) || 3)),
    pricePerNight: Number(row.pricePerNight) || 0,
    currency: String(row.currency ?? "USD"),
    coverImage:
      String(row.coverImage ?? "").trim() ||
      imgs[0] ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    images:
      imgs.length > 0
        ? imgs
        : [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
          ],
    status,
    totalRooms: Math.max(1, Number(row.totalRooms) || 1),
    availableRooms: Math.max(0, Number(row.availableRooms) || 0),
    rating: Number(row.rating) || 0,
    reviewCount: Math.max(0, Number(row.reviewCount) || 0),
    occupancyRate: Math.min(100, Math.max(0, Number(row.occupancyRate) || 0)),
    monthlyRevenue: Math.max(0, Number(row.monthlyRevenue) || 0),
    description: String(row.description ?? ""),
    amenities: Array.isArray(row.amenities)
      ? (row.amenities as unknown[]).map((a) => String(a))
      : [],
    createdAt,
  };
}
