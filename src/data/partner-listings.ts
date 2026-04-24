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

export const partnerListings: PartnerListing[] = [
  {
    id: "listing-1",
    name: "The Grand Amalfi Coastal Retreat",
    type: "hotel",
    city: "Positano",
    country: "Italy",
    address: "Via Pasitea 142, 84017 Positano, Italy",
    starRating: 5,
    pricePerNight: 425,
    currency: "USD",
    coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
    ],
    status: "published",
    totalRooms: 24,
    availableRooms: 7,
    rating: 4.8,
    reviewCount: 342,
    occupancyRate: 71,
    monthlyRevenue: 68400,
    description:
      "Cliffside boutique hotel overlooking the Tyrrhenian Sea, featuring infinity pools and world-class Italian cuisine.",
    amenities: ["Pool", "Spa", "Restaurant", "Bar", "Free WiFi", "Parking", "Beach Access"],
    createdAt: "2024-03-15",
  },
  {
    id: "listing-2",
    name: "Kyoto Zen Garden Residences",
    type: "apartment",
    city: "Kyoto",
    country: "Japan",
    address: "Higashiyama Ward, 605-0846 Kyoto, Japan",
    starRating: 4,
    pricePerNight: 215,
    currency: "USD",
    coverImage: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
    ],
    status: "published",
    totalRooms: 12,
    availableRooms: 3,
    rating: 4.9,
    reviewCount: 187,
    occupancyRate: 75,
    monthlyRevenue: 32000,
    description:
      "Traditional Japanese-style apartments with private gardens, steps from Kiyomizu-dera temple.",
    amenities: ["Free WiFi", "Kitchen", "Garden", "Tea Service", "Air Conditioning"],
    createdAt: "2024-06-22",
  },
  {
    id: "listing-3",
    name: "Ubud Jungle Villa Collection",
    type: "villa",
    city: "Ubud",
    country: "Indonesia",
    address: "Jl. Raya Tegallalang, Ubud, Bali",
    starRating: 5,
    pricePerNight: 380,
    currency: "USD",
    coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
      "https://images.unsplash.com/photo-1573790387438-4da905039392?w=1200&q=80",
    ],
    status: "published",
    totalRooms: 8,
    availableRooms: 2,
    rating: 4.9,
    reviewCount: 256,
    occupancyRate: 75,
    monthlyRevenue: 52000,
    description:
      "Private pool villas nestled in the Ubud rice terraces, offering complete tranquility and luxury.",
    amenities: ["Private Pool", "Spa", "Yoga Studio", "Free WiFi", "Airport Transfer"],
    createdAt: "2024-01-10",
  },
  {
    id: "listing-4",
    name: "Reykjavik Aurora Lodge",
    type: "hotel",
    city: "Reykjavik",
    country: "Iceland",
    address: "Laugavegur 87, 101 Reykjavik",
    starRating: 4,
    pricePerNight: 295,
    currency: "USD",
    coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80"],
    status: "paused",
    totalRooms: 18,
    availableRooms: 18,
    rating: 4.6,
    reviewCount: 98,
    occupancyRate: 0,
    monthlyRevenue: 0,
    description:
      "Modern Nordic hotel with floor-to-ceiling windows perfect for Northern Lights viewing.",
    amenities: ["Sauna", "Restaurant", "Bar", "Free WiFi", "Airport Shuttle"],
    createdAt: "2024-09-03",
  },
  {
    id: "listing-5",
    name: "Santorini Cliffside Suites",
    type: "resort",
    city: "Oia",
    country: "Greece",
    address: "Oia, Santorini 847 02, Greece",
    starRating: 5,
    pricePerNight: 580,
    currency: "USD",
    coverImage: "https://images.unsplash.com/photo-1570213489059-0aac6626cade?w=1200&q=80",
    images: ["https://images.unsplash.com/photo-1570213489059-0aac6626cade?w=1200&q=80"],
    status: "draft",
    totalRooms: 15,
    availableRooms: 15,
    rating: 0,
    reviewCount: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    description:
      "Whitewashed luxury suites carved into the caldera cliffs with private plunge pools and breathtaking sunsets.",
    amenities: ["Infinity Pool", "Sea View", "Spa", "Restaurant", "Concierge"],
    createdAt: "2026-03-08",
  },
];

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

export const partnerPayouts: PartnerPayout[] = [
  { id: "pay-001", amount: 18420, status: "paid", period: "March 2026", bookings: 23, date: "2026-04-05", method: "Bank Transfer" },
  { id: "pay-002", amount: 14850, status: "paid", period: "February 2026", bookings: 18, date: "2026-03-05", method: "Bank Transfer" },
  { id: "pay-003", amount: 22100, status: "paid", period: "January 2026", bookings: 27, date: "2026-02-05", method: "Bank Transfer" },
  { id: "pay-004", amount: 6750, status: "pending", period: "April 2026", bookings: 9, date: "2026-05-05", method: "Bank Transfer" },
  { id: "pay-005", amount: 19200, status: "paid", period: "December 2025", bookings: 24, date: "2026-01-05", method: "Bank Transfer" },
  { id: "pay-006", amount: 16480, status: "paid", period: "November 2025", bookings: 20, date: "2025-12-05", method: "Bank Transfer" },
];

export function getPartnerStats() {
  const totalRevenue = partnerPayouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = partnerPayouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalBookings = partnerBookings.length;
  const activeListings = partnerListings.filter((l) => l.status === "published").length;
  const avgOccupancy = Math.round(
    partnerListings
      .filter((l) => l.status === "published")
      .reduce((sum, l) => sum + l.occupancyRate, 0) /
      Math.max(1, activeListings)
  );
  const avgRating =
    partnerListings
      .filter((l) => l.reviewCount > 0)
      .reduce((sum, l) => sum + l.rating, 0) /
    Math.max(1, partnerListings.filter((l) => l.reviewCount > 0).length);

  return {
    totalRevenue,
    pendingRevenue,
    totalBookings,
    activeListings,
    avgOccupancy,
    avgRating: Math.round(avgRating * 10) / 10,
  };
}
