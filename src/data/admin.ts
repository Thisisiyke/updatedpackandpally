export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "traveler" | "host" | "admin";
  status: "active" | "suspended" | "pending-verification";
  verified: boolean;
  joinedAt: string;
  totalBookings: number;
  totalSpent: number;
  country: string;
  lastActive: string;
}

export interface AdminPartner {
  id: string;
  name: string;
  email: string;
  avatar: string;
  company: string;
  status: "verified" | "pending" | "suspended" | "rejected";
  joinedAt: string;
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
  rating: number;
  country: string;
  applicationNotes?: string;
}

export interface AdminBooking {
  id: string;
  type: "flight" | "hotel" | "trip";
  userId: string;
  userName: string;
  userAvatar: string;
  partnerId?: string;
  partnerName?: string;
  title: string;
  destination: string;
  amount: number;
  currency: string;
  status: "confirmed" | "pending" | "cancelled" | "completed" | "disputed";
  createdAt: string;
  checkIn?: string;
  checkOut?: string;
  riskScore: "low" | "medium" | "high";
}

export interface Dispute {
  id: string;
  bookingId: string;
  type: "refund" | "quality-issue" | "no-show" | "misrepresentation" | "other";
  status: "open" | "in-review" | "resolved" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";
  userId: string;
  userName: string;
  userAvatar: string;
  partnerId: string;
  partnerName: string;
  bookingTitle: string;
  amount: number;
  reason: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  slaHours: number;
  evidenceCount: number;
  messageCount: number;
}

export interface ActivityEvent {
  id: string;
  type:
    | "signup"
    | "booking"
    | "cancellation"
    | "refund-request"
    | "partner-application"
    | "review"
    | "listing-published"
    | "payout";
  actor: string;
  avatar?: string;
  description: string;
  amount?: number;
  timestamp: string;
}

// ─── MOCK DATA ───

export const adminUsers: AdminUser[] = [
  {
    id: "u-001",
    name: "Emily Chen",
    email: "emily.chen@example.com",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    role: "traveler",
    status: "active",
    verified: true,
    joinedAt: "2025-08-12",
    totalBookings: 7,
    totalSpent: 8240,
    country: "USA",
    lastActive: "2026-04-12",
  },
  {
    id: "u-002",
    name: "James Whitfield",
    email: "james.w@example.com",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    role: "traveler",
    status: "active",
    verified: true,
    joinedAt: "2024-11-03",
    totalBookings: 12,
    totalSpent: 15680,
    country: "UK",
    lastActive: "2026-04-13",
  },
  {
    id: "u-003",
    name: "Sofia Martinez",
    email: "sofia.m@example.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "host",
    status: "active",
    verified: true,
    joinedAt: "2024-02-15",
    totalBookings: 47,
    totalSpent: 2340,
    country: "Spain",
    lastActive: "2026-04-13",
  },
  {
    id: "u-004",
    name: "Marcus Andersen",
    email: "marcus.a@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "traveler",
    status: "suspended",
    verified: true,
    joinedAt: "2025-06-20",
    totalBookings: 3,
    totalSpent: 4280,
    country: "Denmark",
    lastActive: "2026-03-28",
  },
  {
    id: "u-005",
    name: "Priya Sharma",
    email: "priya.s@example.com",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    role: "traveler",
    status: "active",
    verified: true,
    joinedAt: "2025-03-07",
    totalBookings: 5,
    totalSpent: 6150,
    country: "India",
    lastActive: "2026-04-11",
  },
  {
    id: "u-006",
    name: "Oliver Berg",
    email: "oliver.b@example.com",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    role: "traveler",
    status: "pending-verification",
    verified: false,
    joinedAt: "2026-04-08",
    totalBookings: 0,
    totalSpent: 0,
    country: "Germany",
    lastActive: "2026-04-08",
  },
  {
    id: "u-007",
    name: "Aisha Patel",
    email: "aisha.p@example.com",
    avatar: "https://randomuser.me/api/portraits/women/56.jpg",
    role: "traveler",
    status: "active",
    verified: true,
    joinedAt: "2025-09-14",
    totalBookings: 4,
    totalSpent: 5320,
    country: "Canada",
    lastActive: "2026-04-12",
  },
  {
    id: "u-008",
    name: "Diego Navarro",
    email: "diego.n@example.com",
    avatar: "https://randomuser.me/api/portraits/men/28.jpg",
    role: "traveler",
    status: "active",
    verified: true,
    joinedAt: "2025-12-01",
    totalBookings: 2,
    totalSpent: 1890,
    country: "Mexico",
    lastActive: "2026-04-10",
  },
  {
    id: "u-009",
    name: "Hannah Johansson",
    email: "hannah.j@example.com",
    avatar: "https://randomuser.me/api/portraits/women/19.jpg",
    role: "traveler",
    status: "active",
    verified: true,
    joinedAt: "2024-07-28",
    totalBookings: 9,
    totalSpent: 11420,
    country: "Sweden",
    lastActive: "2026-04-13",
  },
  {
    id: "u-010",
    name: "Ryan Cooper",
    email: "ryan.c@example.com",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    role: "traveler",
    status: "active",
    verified: true,
    joinedAt: "2025-01-20",
    totalBookings: 6,
    totalSpent: 7890,
    country: "USA",
    lastActive: "2026-04-12",
  },
];

export const adminPartners: AdminPartner[] = [
  {
    id: "p-001",
    name: "Sofia Martinez",
    email: "sofia@barcelonatours.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    company: "Barcelona Coastal Tours",
    status: "verified",
    joinedAt: "2024-02-15",
    totalListings: 8,
    totalBookings: 142,
    totalRevenue: 186400,
    rating: 4.9,
    country: "Spain",
  },
  {
    id: "p-002",
    name: "Kenji Tanaka",
    email: "kenji@kyotoadventures.jp",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    company: "Kyoto Cultural Adventures",
    status: "verified",
    joinedAt: "2024-06-20",
    totalListings: 5,
    totalBookings: 98,
    totalRevenue: 142800,
    rating: 4.8,
    country: "Japan",
  },
  {
    id: "p-003",
    name: "Amara Okafor",
    email: "amara@safariphotos.co",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    company: "Okafor Safari Experiences",
    status: "verified",
    joinedAt: "2024-01-10",
    totalListings: 12,
    totalBookings: 186,
    totalRevenue: 324900,
    rating: 5.0,
    country: "Kenya",
  },
  {
    id: "p-004",
    name: "Lucas Andersen",
    email: "lucas@auroralodge.is",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    company: "Aurora Lodge Iceland",
    status: "pending",
    joinedAt: "2026-04-05",
    totalListings: 1,
    totalBookings: 0,
    totalRevenue: 0,
    rating: 0,
    country: "Iceland",
    applicationNotes:
      "Running small Reykjavik boutique hotel for 3 years. Previously listed on another platform. References from 2 guests verified.",
  },
  {
    id: "p-005",
    name: "Priya Sharma",
    email: "priya@baliwellness.id",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    company: "Bali Wellness Retreats",
    status: "verified",
    joinedAt: "2024-09-05",
    totalListings: 6,
    totalBookings: 74,
    totalRevenue: 128600,
    rating: 4.8,
    country: "Indonesia",
  },
  {
    id: "p-006",
    name: "Marco Rivera",
    email: "marco@incaadventures.pe",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    company: "Inca Trail Adventures",
    status: "verified",
    joinedAt: "2024-04-18",
    totalListings: 4,
    totalBookings: 89,
    totalRevenue: 156800,
    rating: 4.7,
    country: "Peru",
  },
  {
    id: "p-007",
    name: "Zara Mohamed",
    email: "zara@saharatours.ma",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    company: "Sahara Expeditions",
    status: "pending",
    joinedAt: "2026-04-09",
    totalListings: 0,
    totalBookings: 0,
    totalRevenue: 0,
    rating: 0,
    country: "Morocco",
    applicationNotes:
      "Family-run business since 2018. Specializes in multi-day desert camps. Business license uploaded.",
  },
  {
    id: "p-008",
    name: "Thomas Hoffmann",
    email: "thomas@luxuryalps.ch",
    avatar: "https://randomuser.me/api/portraits/men/51.jpg",
    company: "Alpine Luxury Retreats",
    status: "suspended",
    joinedAt: "2025-04-12",
    totalListings: 3,
    totalBookings: 24,
    totalRevenue: 48200,
    rating: 3.4,
    country: "Switzerland",
    applicationNotes:
      "Suspended due to multiple guest complaints about misrepresented amenities.",
  },
];

export const adminBookings: AdminBooking[] = [
  {
    id: "B-24891",
    type: "trip",
    userId: "u-001",
    userName: "Emily Chen",
    userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    partnerId: "p-001",
    partnerName: "Barcelona Coastal Tours",
    title: "Coastal Wonders of Amalfi",
    destination: "Amalfi Coast, Italy",
    amount: 2499,
    currency: "USD",
    status: "confirmed",
    createdAt: "2026-04-02",
    checkIn: "2026-06-15",
    checkOut: "2026-06-22",
    riskScore: "low",
  },
  {
    id: "B-24890",
    type: "hotel",
    userId: "u-002",
    userName: "James Whitfield",
    userAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
    partnerId: "p-002",
    partnerName: "Kyoto Cultural Adventures",
    title: "Kyoto Zen Garden Residences",
    destination: "Kyoto, Japan",
    amount: 1340,
    currency: "USD",
    status: "confirmed",
    createdAt: "2026-04-10",
    checkIn: "2026-05-20",
    checkOut: "2026-05-24",
    riskScore: "low",
  },
  {
    id: "B-24889",
    type: "flight",
    userId: "u-005",
    userName: "Priya Sharma",
    userAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    title: "Mumbai → Paris",
    destination: "Paris, France",
    amount: 1890,
    currency: "USD",
    status: "pending",
    createdAt: "2026-04-13",
    riskScore: "medium",
  },
  {
    id: "B-24888",
    type: "trip",
    userId: "u-004",
    userName: "Marcus Andersen",
    userAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    partnerId: "p-008",
    partnerName: "Alpine Luxury Retreats",
    title: "Swiss Alps Adventure",
    destination: "Zermatt, Switzerland",
    amount: 3280,
    currency: "USD",
    status: "disputed",
    createdAt: "2026-03-15",
    checkIn: "2026-04-01",
    checkOut: "2026-04-07",
    riskScore: "high",
  },
  {
    id: "B-24887",
    type: "hotel",
    userId: "u-007",
    userName: "Aisha Patel",
    userAvatar: "https://randomuser.me/api/portraits/women/56.jpg",
    partnerId: "p-005",
    partnerName: "Bali Wellness Retreats",
    title: "Ubud Jungle Villa",
    destination: "Ubud, Indonesia",
    amount: 2280,
    currency: "USD",
    status: "confirmed",
    createdAt: "2026-04-05",
    checkIn: "2026-06-01",
    checkOut: "2026-06-07",
    riskScore: "low",
  },
  {
    id: "B-24886",
    type: "trip",
    userId: "u-003",
    userName: "Sofia Martinez",
    userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    partnerId: "p-006",
    partnerName: "Inca Trail Adventures",
    title: "Ancient Trails of Machu Picchu",
    destination: "Cusco, Peru",
    amount: 2899,
    currency: "USD",
    status: "completed",
    createdAt: "2026-02-20",
    checkIn: "2026-03-15",
    checkOut: "2026-03-24",
    riskScore: "low",
  },
  {
    id: "B-24885",
    type: "flight",
    userId: "u-009",
    userName: "Hannah Johansson",
    userAvatar: "https://randomuser.me/api/portraits/women/19.jpg",
    title: "Stockholm → Bangkok",
    destination: "Bangkok, Thailand",
    amount: 1150,
    currency: "USD",
    status: "cancelled",
    createdAt: "2026-03-28",
    riskScore: "low",
  },
  {
    id: "B-24884",
    type: "trip",
    userId: "u-010",
    userName: "Ryan Cooper",
    userAvatar: "https://randomuser.me/api/portraits/men/12.jpg",
    partnerId: "p-003",
    partnerName: "Okafor Safari Experiences",
    title: "Serengeti Safari Experience",
    destination: "Serengeti, Tanzania",
    amount: 4299,
    currency: "USD",
    status: "confirmed",
    createdAt: "2026-04-11",
    checkIn: "2026-07-10",
    checkOut: "2026-07-19",
    riskScore: "low",
  },
];

export const adminDisputes: Dispute[] = [
  {
    id: "D-1042",
    bookingId: "B-24888",
    type: "misrepresentation",
    status: "open",
    priority: "high",
    userId: "u-004",
    userName: "Marcus Andersen",
    userAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    partnerId: "p-008",
    partnerName: "Alpine Luxury Retreats",
    bookingTitle: "Swiss Alps Adventure",
    amount: 3280,
    reason: "Property did not match photos",
    description:
      "The listing showed a modern chalet with mountain views. Upon arrival, the property was an older building with no views and several amenities missing (hot tub, gym, spa). Multiple issues documented with photos.",
    createdAt: "2026-04-05",
    updatedAt: "2026-04-12",
    slaHours: 24,
    evidenceCount: 8,
    messageCount: 12,
  },
  {
    id: "D-1041",
    bookingId: "B-24823",
    type: "refund",
    status: "in-review",
    priority: "medium",
    userId: "u-002",
    userName: "James Whitfield",
    userAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
    partnerId: "p-001",
    partnerName: "Barcelona Coastal Tours",
    bookingTitle: "Barcelona Food & Wine Tour",
    amount: 840,
    reason: "Trip cancelled within 48 hours",
    description:
      "Guest requested refund after partner cancelled the tour due to illness. Standard policy allows 50% refund but guest is requesting full refund due to non-refundable flight.",
    createdAt: "2026-04-10",
    updatedAt: "2026-04-13",
    slaHours: 48,
    evidenceCount: 3,
    messageCount: 6,
  },
  {
    id: "D-1040",
    bookingId: "B-24701",
    type: "no-show",
    status: "open",
    priority: "low",
    userId: "u-007",
    userName: "Aisha Patel",
    userAvatar: "https://randomuser.me/api/portraits/women/56.jpg",
    partnerId: "p-005",
    partnerName: "Bali Wellness Retreats",
    bookingTitle: "Ubud Yoga Retreat",
    amount: 1650,
    reason: "Partner claims guest didn't show up",
    description:
      "Partner marked guest as no-show and is refusing refund. Guest claims they arrived on time and have evidence of check-in attempt.",
    createdAt: "2026-04-11",
    updatedAt: "2026-04-11",
    slaHours: 72,
    evidenceCount: 5,
    messageCount: 4,
  },
  {
    id: "D-1039",
    bookingId: "B-24612",
    type: "quality-issue",
    status: "open",
    priority: "urgent",
    userId: "u-008",
    userName: "Diego Navarro",
    userAvatar: "https://randomuser.me/api/portraits/men/28.jpg",
    partnerId: "p-008",
    partnerName: "Alpine Luxury Retreats",
    bookingTitle: "Alpine Ski Chalet",
    amount: 5200,
    reason: "Unsafe conditions reported",
    description:
      "Guest reports structural issues including broken heating in winter, water damage, and safety concerns. Photos submitted. Safety team investigating.",
    createdAt: "2026-04-13",
    updatedAt: "2026-04-13",
    slaHours: 6,
    evidenceCount: 14,
    messageCount: 8,
  },
  {
    id: "D-1038",
    bookingId: "B-24501",
    type: "refund",
    status: "resolved",
    priority: "medium",
    userId: "u-005",
    userName: "Priya Sharma",
    userAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    partnerId: "p-006",
    partnerName: "Inca Trail Adventures",
    bookingTitle: "Machu Picchu Trek",
    amount: 2899,
    reason: "Medical emergency",
    description:
      "Guest had documented medical emergency preventing travel. Full refund approved per travel insurance verification.",
    createdAt: "2026-03-22",
    updatedAt: "2026-03-28",
    slaHours: 48,
    evidenceCount: 4,
    messageCount: 9,
  },
  {
    id: "D-1037",
    bookingId: "B-24489",
    type: "other",
    status: "escalated",
    priority: "high",
    userId: "u-010",
    userName: "Ryan Cooper",
    userAvatar: "https://randomuser.me/api/portraits/men/12.jpg",
    partnerId: "p-003",
    partnerName: "Okafor Safari Experiences",
    bookingTitle: "Serengeti Photography Safari",
    amount: 4299,
    reason: "Double booking",
    description:
      "Partner double-booked the dates. Escalated to senior mediator for resolution. Both parties have been notified.",
    createdAt: "2026-04-08",
    updatedAt: "2026-04-12",
    slaHours: 24,
    evidenceCount: 6,
    messageCount: 15,
  },
];

export const activityFeed: ActivityEvent[] = [
  {
    id: "a-001",
    type: "booking",
    actor: "Ryan Cooper",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    description: "Booked Serengeti Safari",
    amount: 4299,
    timestamp: "2 min ago",
  },
  {
    id: "a-002",
    type: "partner-application",
    actor: "Zara Mohamed",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    description: "Applied to become a partner",
    timestamp: "8 min ago",
  },
  {
    id: "a-003",
    type: "refund-request",
    actor: "Marcus Andersen",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    description: "Requested refund for Swiss Alps trip",
    amount: 3280,
    timestamp: "14 min ago",
  },
  {
    id: "a-004",
    type: "signup",
    actor: "Oliver Berg",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    description: "New traveler account created",
    timestamp: "23 min ago",
  },
  {
    id: "a-005",
    type: "review",
    actor: "Emily Chen",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    description: "Left 5-star review for Barcelona Tours",
    timestamp: "34 min ago",
  },
  {
    id: "a-006",
    type: "booking",
    actor: "Aisha Patel",
    avatar: "https://randomuser.me/api/portraits/women/56.jpg",
    description: "Booked Ubud Jungle Villa",
    amount: 2280,
    timestamp: "1 hr ago",
  },
  {
    id: "a-007",
    type: "listing-published",
    actor: "Amara Okafor",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    description: "Published new listing: Kilimanjaro Summit",
    timestamp: "2 hrs ago",
  },
  {
    id: "a-008",
    type: "cancellation",
    actor: "Hannah Johansson",
    avatar: "https://randomuser.me/api/portraits/women/19.jpg",
    description: "Cancelled Stockholm → Bangkok flight",
    amount: 1150,
    timestamp: "3 hrs ago",
  },
  {
    id: "a-009",
    type: "payout",
    actor: "Sofia Martinez",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    description: "Payout processed: $18,420",
    amount: 18420,
    timestamp: "5 hrs ago",
  },
];

export function getAdminStats() {
  return {
    totalUsers: adminUsers.length + 4243,
    newUsersToday: 12,
    activePartners: adminPartners.filter((p) => p.status === "verified").length,
    pendingPartners: adminPartners.filter((p) => p.status === "pending").length,
    totalBookings: 18429,
    bookingsToday: 87,
    gmv: 4_250_000,
    gmvThisMonth: 342_180,
    commission: 637_500,
    commissionThisMonth: 51_327,
    openDisputes: adminDisputes.filter(
      (d) => d.status === "open" || d.status === "in-review"
    ).length,
    urgentDisputes: adminDisputes.filter((d) => d.priority === "urgent").length,
    pendingRefunds: 14280,
    platformHealth: 99.2,
  };
}
