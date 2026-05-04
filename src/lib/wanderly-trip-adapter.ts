import type { Trip } from "@/types";
import type {
  CustomSplit,
  PaymentSchedule,
} from "@/lib/installment-schedule";

const COUNTRY_TO_CONTINENT: Record<string, string> = {
  Italy: "Europe",
  Japan: "Asia",
  France: "Europe",
  Spain: "Europe",
  USA: "North America",
  Iceland: "Europe",
  Indonesia: "Asia",
  UAE: "Asia",
  India: "Asia",
  UK: "Europe",
  Thailand: "Asia",
  Vietnam: "Asia",
  Australia: "Oceania",
  Brazil: "South America",
  Peru: "South America",
  Kenya: "Africa",
  Morocco: "Africa",
};

function continentFromCountry(country: string): string {
  return COUNTRY_TO_CONTINENT[country] || "Europe";
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function tripStatus(
  booked: number,
  max: number
): Trip["status"] {
  if (booked >= max) return "sold-out";
  const ratio = max > 0 ? booked / max : 0;
  if (ratio >= 0.9) return "almost-full";
  if (ratio >= 0.4) return "filling";
  return "upcoming";
}

/** Raw item from wanderly-1 Dynamo `Wan-trips`. */
export type WanderlyTripRecord = {
  _id: string;
  timestamp: string;
  tripName?: string;
  destination?: string;
  country?: string;
  city?: string;
  description?: string;
  tripImages?: string[];
  startDate?: string;
  endDate?: string;
  duration?: string;
  price?: string | number;
  tripTax?: string | number;
  maxGuests?: number;
  booked?: number;
  tripType?: string;
  whatsIncluded?: string[];
  whatsNotIncluded?: string[];
  itinerary?: Array<{
    day?: number;
    title?: string;
    description?: string;
    activities?: string[];
  }>;
  /** Host / creator Wanderly user id (Register `_id`). */
  userId?: string;
  rating?: number;
  reviews?: number;
  adminName?: string;
  adminProfile?: string;
  status?: string;
  visibility?: string;
  nights?: string;
  mornings?: string;
  paylater?: string | boolean;
  /** "biweekly" | "weekly" | "custom" — defaults to "biweekly" when absent. */
  paymentSchedule?: string;
  /** JSON string or array of {dueAt, percent} when paymentSchedule = custom. */
  paymentCustomSplits?: string | CustomSplit[];
  /** Host close-join date (ISO YYYY-MM-DD) — bookings stop after this date. */
  closeJoinDate?: string;
  latitude?: string | number;
  longitude?: string | number;
};

export function wanderlyTripToUiTrip(raw: WanderlyTripRecord): Trip {
  const id = encodeURIComponent(`${raw._id}__${raw.timestamp}`);
  const title = raw.tripName || "Untitled trip";
  const destination = raw.destination || raw.city || "";
  const country = raw.country || "";
  const images = raw.tripImages?.length ? raw.tripImages : ["/placeholder.svg"];
  const maxGuests = Number(raw.maxGuests ?? 12);
  const booked = Number(raw.booked ?? 0);
  const priceNum =
    typeof raw.price === "number" ? raw.price : Number(raw.price ?? 0);
  const taxNum =
    typeof raw.tripTax === "number"
      ? raw.tripTax
      : Number(raw.tripTax ?? 0);

  const start = raw.startDate || "";
  const end = raw.endDate || "";
  let durationDays = 7;
  if (start && end) {
    const a = new Date(start).getTime();
    const b = new Date(end).getTime();
    if (!Number.isNaN(a) && !Number.isNaN(b) && b >= a) {
      durationDays = Math.max(1, Math.round((b - a) / (86400 * 1000)));
    }
  }

  const itinerary =
    raw.itinerary?.map((d, i) => ({
      day: d.day ?? i + 1,
      title: d.title || `Day ${i + 1}`,
      description: d.description || "",
      activities: Array.isArray(d.activities) ? d.activities : [],
    })) || [];

  const category = raw.tripType ? [raw.tripType] : ["Adventure"];

  const latRaw = raw.latitude;
  const lngRaw = raw.longitude;
  const latNum =
    latRaw !== undefined && latRaw !== null && latRaw !== ""
      ? Number(latRaw)
      : undefined;
  const lngNum =
    lngRaw !== undefined && lngRaw !== null && lngRaw !== ""
      ? Number(lngRaw)
      : undefined;
  const hasCoords =
    latNum !== undefined &&
    lngNum !== undefined &&
    !Number.isNaN(latNum) &&
    !Number.isNaN(lngNum);

  const partialEnabled =
    raw.paylater === true || raw.paylater === "true";

  const paymentSchedule: PaymentSchedule = (() => {
    const v = raw.paymentSchedule;
    if (v === "weekly" || v === "biweekly" || v === "custom") return v;
    return "biweekly";
  })();

  let customSplits: CustomSplit[] | undefined;
  if (paymentSchedule === "custom" && raw.paymentCustomSplits) {
    try {
      const parsed =
        typeof raw.paymentCustomSplits === "string"
          ? JSON.parse(raw.paymentCustomSplits)
          : raw.paymentCustomSplits;
      if (Array.isArray(parsed)) {
        customSplits = parsed
          .map((s) => ({
            dueAt: String(s?.dueAt || ""),
            percent: Number(s?.percent || 0),
          }))
          .filter((s) => s.dueAt && s.percent > 0);
      }
    } catch {
      customSplits = undefined;
    }
  }

  return {
    id,
    title,
    slug: slugify(title),
    destination,
    country,
    continent: continentFromCountry(country),
    description: raw.description || "",
    shortDescription: (raw.description || "").slice(0, 160),
    coverImage: images[0],
    images,
    startDate: start,
    endDate: end,
    durationDays,
    price: priceNum,
    currency: "USD",
    maxGroupSize: maxGuests,
    currentBookings: booked,
    difficulty: "Easy",
    category,
    highlights: (raw.whatsIncluded || []).slice(0, 8),
    itinerary,
    hostId: raw.userId || "unknown-host",
    rating: typeof raw.rating === "number" ? raw.rating : 4.8,
    reviewCount: typeof raw.reviews === "number" ? raw.reviews : 0,
    included: raw.whatsIncluded || [],
    notIncluded: raw.whatsNotIncluded || [],
    status: tripStatus(booked, maxGuests),
    taxRate: 0.0825,
    partialPayment: partialEnabled
      ? {
          enabled: true,
          schedule: paymentSchedule,
          ...(customSplits ? { customSplits } : {}),
        }
      : undefined,
    closeJoinDate:
      typeof raw.closeJoinDate === "string" && raw.closeJoinDate
        ? raw.closeJoinDate
        : undefined,
    wanderly: {
      _id: raw._id,
      timestamp: raw.timestamp,
      tripTax: taxNum,
      adminName: raw.adminName,
      adminProfile: raw.adminProfile,
      nights: raw.nights,
      mornings: raw.mornings,
      paylater: raw.paylater,
      city: raw.city,
      ...(hasCoords ? { latitude: latNum, longitude: lngNum } : {}),
    },
  };
}
