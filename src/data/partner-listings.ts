export interface PartnerListing {
  id: string;
  name: string;
  type: "hotel" | "apartment" | "resort" | "villa" | "hostel";
  city: string;
  country: string;
  address: string;
  starRating: number;
  pricePerNight: number;
  currency: string;
  coverImage: string;
  images: string[];
  status: "published" | "draft" | "paused";
  totalRooms: number;
  availableRooms: number;
  rating: number;
  reviewCount: number;
  occupancyRate: number;
  monthlyRevenue: number;
  description: string;
  amenities: string[];
  createdAt: string;
}

export interface PartnerBooking {
  id: string;
  listingId: string;
  guestName: string;
  guestEmail: string;
  guestAvatar: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  bookedAt: string;
  roomType: string;
}

export interface PartnerPayout {
  id: string;
  amount: number;
  status: "paid" | "pending" | "processing";
  period: string;
  bookings: number;
  date: string;
  method: string;
}

/** Listing rows now load from API (`Wan-listings`). Kept empty for legacy imports. */
export const partnerListings: PartnerListing[] = [];

export const partnerBookings: PartnerBooking[] = [
  {
    id: "pb-001",
    listingId: "listing-1",
    guestName: "Emily Chen",
    guestEmail: "emily.chen@example.com",
    guestAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    checkIn: "2026-05-12",
    checkOut: "2026-05-16",
    guests: 2,
    nights: 4,
    totalPrice: 1700,
    status: "confirmed",
    bookedAt: "2026-04-02",
    roomType: "Deluxe Sea View",
  },
  {
    id: "pb-002",
    listingId: "listing-1",
    guestName: "James Whitfield",
    guestEmail: "james.w@example.com",
    guestAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
    checkIn: "2026-05-20",
    checkOut: "2026-05-24",
    guests: 3,
    nights: 4,
    totalPrice: 2100,
    status: "pending",
    bookedAt: "2026-04-10",
    roomType: "Family Suite",
  },
  {
    id: "pb-003",
    listingId: "listing-2",
    guestName: "Priya Sharma",
    guestEmail: "priya.s@example.com",
    guestAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    checkIn: "2026-04-28",
    checkOut: "2026-05-03",
    guests: 2,
    nights: 5,
    totalPrice: 1075,
    status: "confirmed",
    bookedAt: "2026-03-21",
    roomType: "Zen Garden Room",
  },
  {
    id: "pb-004",
    listingId: "listing-3",
    guestName: "Marcus Andersen",
    guestEmail: "marcus.a@example.com",
    guestAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    checkIn: "2026-06-01",
    checkOut: "2026-06-07",
    guests: 2,
    nights: 6,
    totalPrice: 2280,
    status: "confirmed",
    bookedAt: "2026-04-05",
    roomType: "Private Pool Villa",
  },
  {
    id: "pb-005",
    listingId: "listing-1",
    guestName: "Sofia Martinez",
    guestEmail: "sofia.m@example.com",
    guestAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    checkIn: "2026-03-15",
    checkOut: "2026-03-19",
    guests: 2,
    nights: 4,
    totalPrice: 1700,
    status: "completed",
    bookedAt: "2026-02-01",
    roomType: "Deluxe Sea View",
  },
  {
    id: "pb-006",
    listingId: "listing-3",
    guestName: "Aisha Patel",
    guestEmail: "aisha.p@example.com",
    guestAvatar: "https://randomuser.me/api/portraits/women/56.jpg",
    checkIn: "2026-07-04",
    checkOut: "2026-07-11",
    guests: 4,
    nights: 7,
    totalPrice: 2660,
    status: "pending",
    bookedAt: "2026-04-12",
    roomType: "Luxury Jungle Villa",
  },
  {
    id: "pb-007",
    listingId: "listing-2",
    guestName: "Oliver Berg",
    guestEmail: "oliver.b@example.com",
    guestAvatar: "https://randomuser.me/api/portraits/men/67.jpg",
    checkIn: "2026-03-08",
    checkOut: "2026-03-11",
    guests: 1,
    nights: 3,
    totalPrice: 645,
    status: "cancelled",
    bookedAt: "2026-02-10",
    roomType: "Traditional Room",
  },
];

/** Legacy mock removed — payouts load from Stripe Connect (`/api/partner/payouts`). */
export const partnerPayouts: PartnerPayout[] = [];

export function getPartnerStats() {
  const totalRevenue = partnerPayouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = partnerPayouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalBookings = partnerBookings.length;
  const publishedListings = partnerListings.filter((l) => l.status === "published");
  const activeListings = publishedListings.length;
  const avgOccupancy =
    activeListings === 0
      ? 0
      : Math.round(
          publishedListings.reduce((sum, l) => sum + l.occupancyRate, 0) /
            activeListings
        );
  const withReviews = partnerListings.filter((l) => l.reviewCount > 0);
  const avgRating =
    withReviews.length === 0
      ? 0
      : Math.round(
          (withReviews.reduce((sum, l) => sum + l.rating, 0) / withReviews.length) * 10
        ) / 10;

  return {
    totalRevenue,
    pendingRevenue,
    totalBookings,
    activeListings,
    avgOccupancy,
    avgRating,
  };
}
