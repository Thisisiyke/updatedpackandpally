export interface Trip {
  id: string;
  title: string;
  slug: string;
  destination: string;
  country: string;
  continent: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  images: string[];
  startDate: string;
  endDate: string;
  durationDays: number;
  price: number;
  currency: string;
  maxGroupSize: number;
  currentBookings: number;
  difficulty: "Easy" | "Moderate" | "Challenging";
  category: string[];
  highlights: string[];
  itinerary: ItineraryDay[];
  hostId: string;
  rating: number;
  reviewCount: number;
  included: string[];
  notIncluded: string[];
  status: "upcoming" | "filling" | "almost-full" | "sold-out";
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface Host {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  languages: string[];
  tripsHosted: number;
  rating: number;
  reviewCount: number;
  specialties: string[];
  joinedDate: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  location: string;
  tripTitle: string;
  quote: string;
  rating: number;
}

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  status: "confirmed" | "pending" | "cancelled";
  bookedDate: string;
  travelers: number;
  totalPrice: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "traveler" | "host";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

export interface PackingCategory {
  name: string;
  icon: string;
  items: PackingItem[];
}

export interface PackingItem {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
  isCustom: boolean;
}

export interface PackingList {
  id: string;
  destination: string;
  categories: PackingCategory[];
  generatedAt: Date;
}

export interface GeneratedTrip {
  id: string;
  title: string;
  subtitle: string;
  destination: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  totalEstimatedCost: number;
  days: GeneratedTripDay[];
  tips: string[];
}

export interface GeneratedTripDay {
  dayNumber: number;
  theme: string;
  activities: GeneratedActivity[];
}

export interface GeneratedActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  estimatedCost: number;
  duration: string;
  type: "sightseeing" | "dining" | "adventure" | "relaxation" | "transport" | "shopping";
}
