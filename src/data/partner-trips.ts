export interface PartnerTrip {
  id: string;
  title: string;
  slug: string;
  destination: string;
  country: string;
  category: string[];
  difficulty: "Easy" | "Moderate" | "Challenging";
  coverImage: string;
  images: string[];
  startDate: string;
  endDate: string;
  durationDays: number;
  price: number;
  // Optional tiered pricing — when set, overrides `price` based on group size
  // Keys are the minimum number of travelers (1, 2, 3) at which the rate applies
  priceTiers?: {
    solo: number;       // price per person, 1 traveler
    couple: number;     // price per person, 2 travelers
    groupOf3: number;   // price per person, 3+ travelers
  };
  /** Decimal (e.g. 0.0825 for 8.25%). Platform default 8.25% if unset. */
  taxRate?: number;
  /**
   * Host opt-in: when enabled, travelers see a 3-installment schedule at
   * checkout instead of the platform 30%-deposit option. The schedule is
   * computed from the trip's start date.
   */
  partialPayment?: {
    enabled: boolean;
    /** 3-tuple of decimals summing to 1. Defaults to equal thirds. */
    splits: [number, number, number];
  };
  /** Host opt-in: travelers must upload a government ID at checkout. */
  requireTravelerId?: boolean;
  /** Host opt-in: travelers see an optional social-media profile input. */
  requestSocialMedia?: boolean;
  /** Optional PDF the host uploaded as the trip's formal policy document. */
  tripPolicyPdf?: {
    name: string;
    /** data: URL — works in localStorage demo; would be a CDN URL in prod. */
    dataUrl: string;
    sizeBytes?: number;
  };
  /** Free-form host policy / house rules surfaced to travelers. */
  hostPolicy?: string;
  currency: string;
  maxGroupSize: number;
  currentBookings: number;
  description: string;
  highlights: string[];
  itinerary: { day: number; title: string; description: string; activities: string[] }[];
  included: string[];
  notIncluded: string[];
  status: "published" | "draft" | "sold-out";
  /**
   * Discovery visibility. Independent of `status`.
   *  - "public"  → listed in browse / featured / mobile discovery feeds
   *  - "private" → only reachable via direct share link (not listed)
   * Defaults to "public" for legacy trips that don't set it.
   */
  visibility?: "public" | "private";
  revenue: number;
  createdAt: string;
  rating: number;
  reviewCount: number;
}

export const partnerTrips: PartnerTrip[] = [
  {
    id: "ptrip-1",
    title: "Coastal Wonders of Amalfi",
    slug: "coastal-wonders-amalfi",
    destination: "Amalfi Coast",
    country: "Italy",
    category: ["Cultural", "Coastal"],
    difficulty: "Easy",
    coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80",
      "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&q=80",
    ],
    startDate: "2026-06-15",
    endDate: "2026-06-22",
    durationDays: 7,
    price: 2499,
    currency: "USD",
    maxGroupSize: 12,
    currentBookings: 8,
    description:
      "A week exploring the cliffs, villages and cuisine of Italy's most iconic coast.",
    highlights: [
      "Sunset boat tour along the coastline",
      "Private cooking class with local Nonna",
      "Hike the Path of the Gods",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Sorrento", description: "Welcome dinner by the sea.", activities: ["Airport pickup", "Hotel check-in", "Welcome dinner"] },
      { day: 2, title: "Positano & Path of the Gods", description: "Hike then explore Positano.", activities: ["Morning hike", "Village exploration", "Beach time"] },
    ],
    included: [
      "6 nights accommodation",
      "Daily breakfast",
      "All activities listed",
      "Private boat tour",
      "Airport transfers",
    ],
    notIncluded: [
      "International flights",
      "Travel insurance",
      "Lunch & dinner (except Day 1)",
      "Personal expenses",
    ],
    status: "published",
    revenue: 19992,
    createdAt: "2026-01-15",
    rating: 4.9,
    reviewCount: 18,
  },
  {
    id: "ptrip-2",
    title: "Sacred Temples of Kyoto",
    slug: "sacred-temples-kyoto",
    destination: "Kyoto",
    country: "Japan",
    category: ["Cultural", "Spiritual"],
    difficulty: "Easy",
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80",
    images: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80"],
    startDate: "2026-04-01",
    endDate: "2026-04-09",
    durationDays: 8,
    price: 3199,
    currency: "USD",
    maxGroupSize: 10,
    currentBookings: 10,
    description: "8 days of temples, tea ceremonies, and Zen gardens in Japan's cultural heart.",
    highlights: [
      "Sunrise at Fushimi Inari torii gates",
      "Traditional tea ceremony",
      "Bamboo grove walk in Arashiyama",
    ],
    itinerary: [
      { day: 1, title: "Arrival", description: "Welcome to Kyoto.", activities: ["Pickup", "Check-in"] },
    ],
    included: [
      "7 nights accommodation (ryokan + hotel)",
      "Daily breakfast",
      "Tea ceremony",
      "All temple entry fees",
      "Local transport pass",
    ],
    notIncluded: [
      "International flights",
      "Travel insurance",
      "Most lunches & dinners",
      "Personal shopping",
    ],
    status: "sold-out",
    revenue: 31990,
    createdAt: "2025-11-02",
    rating: 4.8,
    reviewCount: 22,
  },
  {
    id: "ptrip-3",
    title: "Morocco Desert Adventure",
    slug: "morocco-desert",
    destination: "Marrakech & Sahara",
    country: "Morocco",
    category: ["Adventure", "Cultural"],
    difficulty: "Moderate",
    coverImage: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200&q=80",
    images: ["https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200&q=80"],
    startDate: "2026-10-05",
    endDate: "2026-10-13",
    durationDays: 8,
    price: 2299,
    currency: "USD",
    maxGroupSize: 12,
    currentBookings: 3,
    description:
      "From Marrakech medinas to Sahara stargazing — an unforgettable Moroccan odyssey.",
    highlights: [
      "Sunset camel ride into the Sahara",
      "Overnight luxury desert camp",
      "Blue city of Chefchaouen",
    ],
    itinerary: [
      { day: 1, title: "Marrakech", description: "Arrival in the Red City.", activities: ["Medina walk", "Welcome dinner"] },
    ],
    included: [
      "7 nights accommodation",
      "Camel trek",
      "All transport",
      "Guided tours",
      "Airport transfers",
    ],
    notIncluded: [
      "International flights",
      "Travel insurance",
      "Lunches & dinners (except Day 1)",
      "Souvenir shopping",
    ],
    status: "published",
    revenue: 6897,
    createdAt: "2026-02-20",
    rating: 4.8,
    reviewCount: 3,
  },
  {
    id: "ptrip-4",
    title: "Patagonia Expedition",
    slug: "patagonia-expedition",
    destination: "Torres del Paine",
    country: "Chile",
    category: ["Trekking", "Adventure"],
    difficulty: "Challenging",
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
    images: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80"],
    startDate: "2026-12-01",
    endDate: "2026-12-09",
    durationDays: 9,
    price: 3799,
    currency: "USD",
    maxGroupSize: 8,
    currentBookings: 0,
    description: "Conquer the W Trek through granite towers and electric-blue glaciers.",
    highlights: ["W Trek through Torres del Paine", "Grey Glacier up-close", "Sunrise at the Base of the Towers"],
    itinerary: [{ day: 1, title: "Punta Arenas", description: "Arrival.", activities: ["Gear check"] }],
    included: [
      "8 nights accommodation",
      "All meals on trek",
      "Park fees",
      "Camping equipment",
      "Professional guide",
    ],
    notIncluded: [
      "International flights",
      "Travel insurance",
      "Sleeping bag rental",
      "Personal gear",
    ],
    status: "draft",
    revenue: 0,
    createdAt: "2026-03-25",
    rating: 0,
    reviewCount: 0,
  },
];

export const defaultIncluded = [
  "Accommodation",
  "Daily breakfast",
  "All activities listed in itinerary",
  "Airport transfers",
  "Local guide",
  "All transport during the trip",
  "Entrance fees to attractions",
  "Group leader / host throughout",
  "Welcome dinner",
  "Farewell dinner",
];

export const defaultNotIncluded = [
  "International flights",
  "Travel insurance",
  "Visa fees",
  "Lunches and dinners (unless specified)",
  "Personal expenses",
  "Tips & gratuities",
  "Drinks and alcohol",
  "Optional activities",
  "Airport taxes",
  "Souvenirs and shopping",
];

export const tripCategories = [
  "Adventure",
  "Cultural",
  "Wellness",
  "Culinary",
  "Trekking",
  "Photography",
  "Wildlife",
  "Safari",
  "Coastal",
  "Spiritual",
  "Historical",
  "Beach",
  "Arctic",
  "Desert",
];
