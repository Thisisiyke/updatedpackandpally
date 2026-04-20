import { GeneratedTrip, GeneratedTripDay } from "@/types";
import { simulateDelay } from "./simulate-delay";

const TEMPLATES: Record<
  string,
  { title: string; coverImage: string; days: GeneratedTripDay[] }
> = {
  bali: {
    title: "Bali Bliss: A Journey Through Paradise",
    coverImage:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
    days: [
      {
        dayNumber: 1,
        theme: "Arrival & Welcome",
        activities: [
          { id: "a1", time: "02:00 PM", title: "Airport Arrival & Transfer", description: "Welcome to Bali! Private transfer to your villa in Ubud.", location: "Ngurah Rai Airport", estimatedCost: 25, duration: "1.5 hours", type: "transport" },
          { id: "a2", time: "05:00 PM", title: "Sunset at Tegallalang Rice Terraces", description: "Watch the golden hour paint the famous rice paddies.", location: "Tegallalang, Ubud", estimatedCost: 10, duration: "2 hours", type: "sightseeing" },
          { id: "a3", time: "07:30 PM", title: "Welcome Dinner at Locavore", description: "Farm-to-table Indonesian cuisine with your group.", location: "Ubud", estimatedCost: 45, duration: "2 hours", type: "dining" },
        ],
      },
      {
        dayNumber: 2,
        theme: "Spiritual Immersion",
        activities: [
          { id: "a4", time: "06:00 AM", title: "Sunrise Yoga", description: "Morning yoga session overlooking the jungle canopy.", location: "Villa terrace", estimatedCost: 15, duration: "1.5 hours", type: "relaxation" },
          { id: "a5", time: "09:00 AM", title: "Tirta Empul Water Purification", description: "Participate in a traditional Balinese purification ritual.", location: "Tirta Empul Temple", estimatedCost: 5, duration: "2 hours", type: "sightseeing" },
          { id: "a6", time: "02:00 PM", title: "Balinese Cooking Class", description: "Learn to cook authentic Balinese dishes with local ingredients.", location: "Ubud", estimatedCost: 35, duration: "3 hours", type: "dining" },
        ],
      },
      {
        dayNumber: 3,
        theme: "Adventure Day",
        activities: [
          { id: "a7", time: "05:00 AM", title: "Mount Batur Sunrise Trek", description: "Hike an active volcano for a breathtaking sunrise at 1,717m.", location: "Mount Batur", estimatedCost: 50, duration: "5 hours", type: "adventure" },
          { id: "a8", time: "12:00 PM", title: "Natural Hot Springs", description: "Soak in volcanic hot springs with mountain views.", location: "Kintamani", estimatedCost: 15, duration: "2 hours", type: "relaxation" },
          { id: "a9", time: "04:00 PM", title: "Ubud Monkey Forest", description: "Walk through the sacred monkey sanctuary.", location: "Ubud", estimatedCost: 5, duration: "1.5 hours", type: "sightseeing" },
        ],
      },
    ],
  },
  japan: {
    title: "Japan Unveiled: Culture, Cuisine & Wonder",
    coverImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80",
    days: [
      {
        dayNumber: 1,
        theme: "Tokyo Arrival",
        activities: [
          { id: "j1", time: "12:00 PM", title: "Arrive in Tokyo", description: "Transfer to your boutique hotel in Shinjuku.", location: "Narita Airport", estimatedCost: 30, duration: "1.5 hours", type: "transport" },
          { id: "j2", time: "04:00 PM", title: "Shibuya Crossing & Harajuku", description: "Experience the world's busiest crossing and Tokyo's fashion district.", location: "Shibuya", estimatedCost: 0, duration: "2 hours", type: "sightseeing" },
          { id: "j3", time: "07:00 PM", title: "Ramen Alley Dinner", description: "Slurp the best ramen in Tokyo's famous Golden Gai.", location: "Shinjuku", estimatedCost: 15, duration: "1.5 hours", type: "dining" },
        ],
      },
      {
        dayNumber: 2,
        theme: "Traditional Tokyo",
        activities: [
          { id: "j4", time: "07:00 AM", title: "Tsukiji Outer Market", description: "Fresh sushi breakfast at the legendary fish market.", location: "Tsukiji", estimatedCost: 25, duration: "2 hours", type: "dining" },
          { id: "j5", time: "10:00 AM", title: "Senso-ji Temple", description: "Visit Tokyo's oldest and most significant Buddhist temple.", location: "Asakusa", estimatedCost: 0, duration: "1.5 hours", type: "sightseeing" },
          { id: "j6", time: "03:00 PM", title: "TeamLab Borderless", description: "Immerse yourself in a digital art wonderland.", location: "Odaiba", estimatedCost: 30, duration: "2 hours", type: "sightseeing" },
        ],
      },
      {
        dayNumber: 3,
        theme: "Kyoto Day",
        activities: [
          { id: "j7", time: "07:00 AM", title: "Shinkansen to Kyoto", description: "Ride the bullet train through scenic Japanese countryside.", location: "Tokyo Station", estimatedCost: 120, duration: "2.5 hours", type: "transport" },
          { id: "j8", time: "11:00 AM", title: "Fushimi Inari Shrine", description: "Walk through thousands of vermillion torii gates.", location: "Fushimi", estimatedCost: 0, duration: "2 hours", type: "sightseeing" },
          { id: "j9", time: "04:00 PM", title: "Tea Ceremony", description: "Experience a traditional Japanese tea ceremony.", location: "Gion", estimatedCost: 40, duration: "1.5 hours", type: "relaxation" },
        ],
      },
    ],
  },
  default: {
    title: "Your Custom Adventure Awaits",
    coverImage:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",
    days: [
      {
        dayNumber: 1,
        theme: "Arrival & Exploration",
        activities: [
          { id: "d1", time: "12:00 PM", title: "Airport Arrival & Transfer", description: "Arrive and transfer to your accommodation.", location: "City Center", estimatedCost: 30, duration: "1 hour", type: "transport" },
          { id: "d2", time: "03:00 PM", title: "City Walking Tour", description: "Explore the highlights with a local guide.", location: "Old Town", estimatedCost: 25, duration: "3 hours", type: "sightseeing" },
          { id: "d3", time: "07:00 PM", title: "Welcome Dinner", description: "Local cuisine dinner with your travel group.", location: "Top-rated restaurant", estimatedCost: 40, duration: "2 hours", type: "dining" },
        ],
      },
      {
        dayNumber: 2,
        theme: "Cultural Immersion",
        activities: [
          { id: "d4", time: "08:00 AM", title: "Local Market Visit", description: "Browse colorful local markets and sample street food.", location: "Central Market", estimatedCost: 15, duration: "2 hours", type: "shopping" },
          { id: "d5", time: "11:00 AM", title: "Historical Sites Tour", description: "Visit the most significant cultural landmarks.", location: "Heritage District", estimatedCost: 20, duration: "3 hours", type: "sightseeing" },
          { id: "d6", time: "03:00 PM", title: "Cooking Class", description: "Learn to prepare traditional local dishes.", location: "Cooking School", estimatedCost: 35, duration: "3 hours", type: "dining" },
        ],
      },
      {
        dayNumber: 3,
        theme: "Adventure & Nature",
        activities: [
          { id: "d7", time: "06:00 AM", title: "Sunrise Nature Trek", description: "Hike to a scenic viewpoint for an unforgettable sunrise.", location: "National Park", estimatedCost: 15, duration: "4 hours", type: "adventure" },
          { id: "d8", time: "01:00 PM", title: "Relaxation Time", description: "Unwind at a spa or hot springs.", location: "Wellness Center", estimatedCost: 40, duration: "2 hours", type: "relaxation" },
          { id: "d9", time: "06:00 PM", title: "Farewell Dinner", description: "Celebrate your adventure with a special dinner.", location: "Scenic Restaurant", estimatedCost: 50, duration: "2.5 hours", type: "dining" },
        ],
      },
    ],
  },
};

export async function generateMockTrip(data: {
  destination: string;
  days: number;
  style: string;
  budget: string;
}): Promise<GeneratedTrip> {
  await simulateDelay(2500 + Math.random() * 1500);

  const dest = data.destination.toLowerCase();
  const template = dest.includes("bali")
    ? TEMPLATES.bali
    : dest.includes("japan") || dest.includes("tokyo") || dest.includes("kyoto")
    ? TEMPLATES.japan
    : TEMPLATES.default;

  const budgetMultiplier =
    data.budget === "budget"
      ? 0.6
      : data.budget === "moderate"
      ? 1
      : data.budget === "luxury"
      ? 1.8
      : 1;

  const days = template.days.slice(0, Math.min(data.days, template.days.length));
  const totalCost = days.reduce(
    (sum, day) =>
      sum + day.activities.reduce((s, a) => s + a.estimatedCost, 0),
    0
  ) * budgetMultiplier;

  return {
    id: `gen-${Date.now()}`,
    title: template.title.replace(
      /Bali|Japan/,
      data.destination || "Destination"
    ),
    subtitle: `A ${data.days}-day ${data.style} adventure`,
    destination: data.destination,
    coverImage: template.coverImage,
    startDate: "2026-06-01",
    endDate: `2026-06-${String(data.days).padStart(2, "0")}`,
    totalEstimatedCost: Math.round(totalCost + 800 * budgetMultiplier),
    days,
    tips: [
      "Book flights at least 2 months in advance for best prices",
      "Travel insurance is highly recommended",
      `Best time to visit: check seasonal weather for ${data.destination}`,
      "Learn a few basic local phrases — locals appreciate the effort!",
      "Keep digital copies of all important documents",
    ],
  };
}
