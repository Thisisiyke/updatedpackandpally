"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  Pencil,
  X,
  Eye,
  Star,
  MapPin,
  Save,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { PartnerListing } from "@/data/partner-listings";
import {
  deletePartnerListing,
  fetchPartnerListing,
  patchPartnerListingStatus,
  updatePartnerListing,
} from "@/lib/partner-listings-client";
import { cn } from "@/lib/utils";

const allAmenities = [
  "Free WiFi",
  "Pool",
  "Spa",
  "Restaurant",
  "Bar",
  "Gym",
  "Parking",
  "Beach Access",
  "Airport Shuttle",
  "Pet Friendly",
  "Kitchen",
  "Washer/Dryer",
  "Air Conditioning",
  "Heating",
  "Garden",
  "Terrace",
  "Concierge",
  "Room Service",
];

function LoadingBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg animate-[fade-in-up_300ms_ease-out]">
      <Check className="h-4 w-4" />
      Changes saved
    </div>
  );
}

export default function ListingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listing, setListing] = useState<PartnerListing | null>(null);

  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [totalRooms, setTotalRooms] = useState(1);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState<PartnerListing["type"]>("hotel");
  const [starRating, setStarRating] = useState(3);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [status, setStatus] = useState<PartnerListing["status"]>("draft");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const mapped = await fetchPartnerListing(id);
        if (cancelled) return;
        setListing(mapped);
        setName(mapped.name);
        setDescription(mapped.description);
        setPrice(mapped.pricePerNight);
        setTotalRooms(mapped.totalRooms);
        setAvailableRooms(mapped.availableRooms);
        setAddress(mapped.address);
        setCity(mapped.city);
        setCountry(mapped.country);
        setType(mapped.type);
        setStarRating(mapped.starRating);
        setAmenities(mapped.amenities || []);
        setStatus(mapped.status);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Listing not found");
          setListing(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async () => {
    if (!listing) return;
    setSaving(true);
    setSaveErr(null);
    try {
      let tr = Math.max(1, Math.floor(totalRooms));
      let ar = Math.min(tr, Math.max(0, Math.floor(availableRooms)));
      const updated = await updatePartnerListing(listing.id, {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        type,
        starRating,
        pricePerNight: price,
        currency: listing.currency,
        totalRooms: tr,
        availableRooms: ar,
        amenities,
        coverImage: listing.coverImage,
        images: listing.images,
        status,
        rating: listing.rating,
        reviewCount: listing.reviewCount,
        occupancyRate: listing.occupancyRate,
        monthlyRevenue: listing.monthlyRevenue,
      });
      setListing(updated);
      setTotalRooms(updated.totalRooms);
      setAvailableRooms(updated.availableRooms);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (next: PartnerListing["status"]) => {
    if (!listing) return;
    setSaveErr(null);
    try {
      const updated = await patchPartnerListingStatus(listing.id, next);
      setListing(updated);
      setStatus(updated.status);
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Could not update status");
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    if (
      !window.confirm(
        `Delete “${listing.name}”? This cannot be undone.`
      )
    )
      return;
    try {
      await deletePartnerListing(listing.id);
      router.push("/partner/listings");
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        Loading listing…
      </div>
    );
  }

  if (loadError || !listing) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <p className="mt-2 text-muted-foreground text-sm">{loadError}</p>
        <Button asChild className="mt-6">
          <Link href="/partner/listings">Back to listings</Link>
        </Button>
      </div>
    );
  }

  const createdLabel =
    listing.createdAt.length >= 10
      ? listing.createdAt.slice(0, 10)
      : listing.createdAt;

  return (
    <div className="p-6 lg:p-10">
      <LoadingBadge visible={saved} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/partner/listings">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {name || "Untitled listing"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              {city}, {country}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                status === "published" &&
                  "bg-emerald-100 text-emerald-800 border-emerald-200",
                status === "draft" &&
                  "bg-gray-100 text-gray-700 border-gray-200",
                status === "paused" &&
                  "bg-amber-100 text-amber-800 border-amber-200"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              type="button"
              disabled
              title="Guest-facing preview coming soon"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save changes
            </Button>
          </div>
          {saveErr && (
            <p className="text-xs text-red-600 max-w-xs text-right">{saveErr}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Photos</h2>
                <p className="text-xs text-muted-foreground">
                  High-quality photos boost bookings by up to 40%
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" type="button" disabled>
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listing.images.map((img, i) => (
                <div
                  key={`${img}-${i}`}
                  className="relative group aspect-square overflow-hidden rounded-xl"
                >
                  <Image
                    src={img}
                    alt={`Photo ${i + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" className="h-8" type="button" disabled>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="destructive" className="h-8" type="button" disabled>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {i === 0 && (
                    <Badge className="absolute top-2 left-2 bg-primary text-white text-[10px]">
                      Cover
                    </Badge>
                  )}
                </div>
              ))}
              <button
                type="button"
                disabled
                className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground opacity-60 cursor-not-allowed"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs font-medium">Add photo</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-bold mb-4">Basics</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Property name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., The Grand Amalfi Retreat"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell guests what makes your property special..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property type</Label>
                  <Select
                    value={type}
                    onValueChange={(v) =>
                      v && setType(v as PartnerListing["type"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="resort">Resort</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="hostel">Hostel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Star rating</Label>
                  <Select
                    value={String(starRating)}
                    onValueChange={(v) => v && setStarRating(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} star{n > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-bold mb-4">Location</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Street address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-bold mb-4">Pricing & Rooms</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base price per night</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Total rooms</Label>
                <Input
                  type="number"
                  value={totalRooms}
                  onChange={(e) => setTotalRooms(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Available rooms</Label>
                <Input
                  type="number"
                  value={availableRooms}
                  onChange={(e) => setAvailableRooms(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-bold mb-1">Amenities</h2>
            <p className="text-xs text-muted-foreground mb-4">
              {amenities.length} selected
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {allAmenities.map((a) => (
                <label
                  key={a}
                  className="flex items-center gap-2 text-sm cursor-pointer rounded-lg border p-2.5 hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    checked={amenities.includes(a)}
                    onCheckedChange={() => toggleAmenity(a)}
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-bold mb-3">Listing status</h3>
            <Select
              value={status}
              onValueChange={(v) => {
                if (v) void handleStatusChange(v as PartnerListing["status"]);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">
              {status === "published" && "Visible to guests and bookable"}
              {status === "draft" && "Not visible to guests"}
              {status === "paused" && "Temporarily hidden from search"}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-bold mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    Occupancy
                  </span>
                  <span className="text-sm font-bold">
                    {listing.occupancyRate}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${listing.occupancyRate}%` }}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold">{listing.rating}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                  <p className="text-sm font-bold">{listing.reviewCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue/mo</p>
                  <p className="text-sm font-bold">
                    ${Math.round(listing.monthlyRevenue / 1000)}k
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-bold">{createdLabel}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
            <h3 className="font-bold text-red-900 mb-1">Danger zone</h3>
            <p className="text-xs text-red-700/80 mb-4">
              Deleting a listing is permanent and cannot be undone.
            </p>
            <Button
              variant="destructive"
              size="sm"
              type="button"
              onClick={() => void handleDelete()}
            >
              Delete listing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
