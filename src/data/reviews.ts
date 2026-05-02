/**
 * Per-trip traveler reviews. Seeded with hand-authored entries for the
 * popular demo trips; user-submitted reviews are appended via localStorage.
 */

export interface Review {
  id: string;
  tripId: string;
  traveler: {
    id: string;
    name: string;
    avatar: string;
    location?: string;
  };
  rating: number; // 1-5
  title: string;
  body: string;
  /** Trip date the reviewer attended — distinct from the review submission date. */
  attendedAt?: string;
  createdAt: string;
  /** Optional photos from the trip. */
  photos?: string[];
}

const STORAGE_KEY = "packpally_user_reviews";
const CHANGE_EVENT = "packpally_reviews_change";

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60_000).toISOString();
}

const SEED: Review[] = [
  // trip-1 Amalfi
  {
    id: "rv-am-1",
    tripId: "trip-1",
    traveler: {
      id: "t-emily",
      name: "Emily Chen",
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
      location: "San Francisco, CA",
    },
    rating: 5,
    title: "Sofia is the warmest host I've ever had",
    body: "From the moment we landed in Naples to the goodbye dinner, every detail was thought through. The cooking class in Positano alone was worth the price. Already plotting my next trip with Pack & Pally.",
    attendedAt: daysAgo(120),
    createdAt: daysAgo(90),
  },
  {
    id: "rv-am-2",
    tripId: "trip-1",
    traveler: {
      id: "t-james",
      name: "James Whitfield",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      location: "Brooklyn, NY",
    },
    rating: 5,
    title: "Hidden coves and pasta heaven",
    body: "I came solo and left with friends. Sofia knows every barista, fisherman, and grandmother along the coast. The private boat day was unreal — we anchored at coves you can't get to any other way.",
    attendedAt: daysAgo(150),
    createdAt: daysAgo(135),
  },
  {
    id: "rv-am-3",
    tripId: "trip-1",
    traveler: {
      id: "t-aisha",
      name: "Aisha Patel",
      avatar: "https://randomuser.me/api/portraits/women/56.jpg",
      location: "Toronto, ON",
    },
    rating: 4,
    title: "Magical but a bit packed",
    body: "Loved nearly every moment — the food, the views, the company. Day 5 was a touch rushed for me; I'd have happily traded one site for more time at the beach. Still a 4-star trip easily.",
    attendedAt: daysAgo(180),
    createdAt: daysAgo(170),
  },
  {
    id: "rv-am-4",
    tripId: "trip-1",
    traveler: {
      id: "t-marcus",
      name: "Marcus Reeves",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      location: "London, UK",
    },
    rating: 5,
    title: "Worth every dollar",
    body: "Hostel-tier prices give you airport pickup and a cold beer. This was the opposite — yacht-tier hosting at a price that felt fair. Sofia and her local network are the secret.",
    attendedAt: daysAgo(220),
    createdAt: daysAgo(210),
  },

  // trip-2 Kyoto
  {
    id: "rv-ky-1",
    tripId: "trip-2",
    traveler: {
      id: "t-oliver",
      name: "Oliver Berg",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      location: "Stockholm, SE",
    },
    rating: 5,
    title: "Tea ceremonies and quiet temples",
    body: "Kenji opens doors most tourists don't even know exist. The early-morning ryokan walk to Fushimi Inari before the crowds was a moment I'll remember forever.",
    attendedAt: daysAgo(95),
    createdAt: daysAgo(80),
  },
  {
    id: "rv-ky-2",
    tripId: "trip-2",
    traveler: {
      id: "t-hannah",
      name: "Hannah Johansson",
      avatar: "https://randomuser.me/api/portraits/women/19.jpg",
      location: "Copenhagen, DK",
    },
    rating: 5,
    title: "Cherry blossoms peaked perfectly",
    body: "Kenji's timing was spot on — we hit the bloom at its peak. The cooking class in his friend's home and the bamboo grove walk were both highlights.",
    attendedAt: daysAgo(70),
    createdAt: daysAgo(60),
  },

  // trip-3 Serengeti
  {
    id: "rv-sg-1",
    tripId: "trip-3",
    traveler: {
      id: "t-ryan",
      name: "Ryan Cooper",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      location: "Seattle, WA",
    },
    rating: 5,
    title: "A bucket-list trip done right",
    body: "Amara's knowledge of the migration patterns is unreal. We saw a leopard with a kill on day 2 and a river crossing on day 4. The camp was glamping done well — hot showers under the stars.",
    attendedAt: daysAgo(160),
    createdAt: daysAgo(140),
  },
  {
    id: "rv-sg-2",
    tripId: "trip-3",
    traveler: {
      id: "t-diego",
      name: "Diego Navarro",
      avatar: "https://randomuser.me/api/portraits/men/28.jpg",
      location: "Mexico City, MX",
    },
    rating: 4,
    title: "Incredible, just bring a longer lens",
    body: "Trip of a lifetime. My only nitpick is to come with at least a 200mm — Amara warned us, but I underpacked. She had a spare lens I borrowed for half a day.",
    attendedAt: daysAgo(220),
    createdAt: daysAgo(200),
  },
  {
    id: "rv-sg-3",
    tripId: "trip-3",
    traveler: {
      id: "t-sarah",
      name: "Sarah Mitchell",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      location: "Austin, TX",
    },
    rating: 5,
    title: "Felt seen and safe",
    body: "Solo female traveler here — Amara made the camp feel like a family dinner every night. Never once felt out of place. The sunrise hot-air balloon was every bit as magical as you imagine.",
    attendedAt: daysAgo(250),
    createdAt: daysAgo(240),
  },
];

function readUserReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUserReviews(list: Review[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

export function getReviewsForTrip(tripId: string): Review[] {
  const merged = [...readUserReviews(), ...SEED.filter((r) => r.tripId === tripId)];
  // Keep user-submitted on top, then by recency
  return merged
    .filter((r) => r.tripId === tripId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function saveReview(
  input: Omit<Review, "id" | "createdAt">
): Review {
  const record: Review = {
    ...input,
    id: `rv-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  writeUserReviews([record, ...readUserReviews()]);
  return record;
}

export function subscribeToReviews(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function summarizeReviews(reviews: Review[]) {
  const total = reviews.length;
  const avg =
    total > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / total
      : 0;
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.round(r.rating) === stars).length,
  }));
  return { total, avg, distribution };
}
