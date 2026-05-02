import { Hotel, RoomType, HotelSearchParams } from "@/types/booking";

function seedFrom(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hotelNamePool = {
  prefixes: ["Grand", "The", "Royal", "Ocean", "Park", "Sunset", "Hilltop", "Azure", "Imperial", "Boutique", "Mountain View", "Harbour", "Heritage", "Metropolitan", "Garden", "The Westbrook", "Wilshire", "The Haven"],
  suffixes: ["Hotel", "Resort & Spa", "Boutique Hotel", "Palace", "Suites", "Residences", "Retreat", "Lodge", "Inn", "Hotel & Spa"],
};

const neighborhoodPool = ["Downtown", "Old Town", "Waterfront", "City Center", "Historic District", "Marina", "Business District", "Beachfront", "Arts Quarter", "Trendy Midtown", "Airport Area"];

const cityImageMap: Record<string, string[]> = {
  "New York": [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    "https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200&q=80",
    "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1200&q=80",
  ],
  Paris: [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
    "https://images.unsplash.com/photo-1549144511-f099e773c147?w=1200&q=80",
    "https://images.unsplash.com/photo-1549144511-f099e773c147?w=1200&q=80",
  ],
  Tokyo: [
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80",
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&q=80",
  ],
  Dubai: [
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80",
  ],
  Bali: [
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
    "https://images.unsplash.com/photo-1573790387438-4da905039392?w=1200&q=80",
  ],
  Denpasar: [
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
    "https://images.unsplash.com/photo-1573790387438-4da905039392?w=1200&q=80",
  ],
};

const defaultHotelImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
  "https://images.unsplash.com/photo-1596386461350-326ccb383e9f?w=1200&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
];

const roomImages = [
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
];

const amenityPool = [
  "Free WiFi", "Swimming Pool", "Fitness Center", "Spa", "Restaurant", "Bar",
  "Room Service", "24-hour Front Desk", "Concierge", "Parking", "Airport Shuttle",
  "Business Center", "Meeting Rooms", "Laundry Service", "Dry Cleaning",
  "Breakfast Included", "Air Conditioning", "Pet Friendly", "Family Rooms",
  "Non-smoking Rooms", "Terrace", "Garden", "Hot Tub", "Sauna", "Beach Access",
];

/** Fisher–Yates with a seeded RNG — same seed ⇒ same order (safe for SSR + hydration). */
function shuffleDeterministic<T>(items: T[], rand: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Fixed stay window for marketing / landing so server render matches the client
 * (no `Date.now()` in render paths that generate hotel lists or links).
 */
export function getMarketingHotelStayDates(): { checkIn: string; checkOut: string } {
  const start = new Date("2025-12-20T12:00:00.000Z");
  const checkIn = new Date(start);
  checkIn.setUTCDate(start.getUTCDate() + 7);
  const checkOut = new Date(start);
  checkOut.setUTCDate(start.getUTCDate() + 10);
  return {
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}

function getImagesForCity(city: string, rand: () => number, count: number): string[] {
  const cityImages = cityImageMap[city];
  const pool = cityImages && cityImages.length >= 2 ? cityImages : defaultHotelImages;
  const shuffled = shuffleDeterministic([...pool], rand);
  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    results.push(shuffled[i % shuffled.length]);
  }
  return results;
}

function generateRoomTypes(
  basePrice: number,
  rand: () => number
): RoomType[] {
  const types: RoomType[] = [
    {
      id: "standard",
      name: "Standard Double Room",
      description: "Comfortable room with all the essentials for a great stay.",
      maxGuests: 2,
      bedConfig: "1 Queen Bed",
      pricePerNight: basePrice,
      image: roomImages[0],
      amenities: ["Free WiFi", "Air Conditioning", "Private Bathroom", "TV"],
      refundable: rand() > 0.4,
      breakfastIncluded: rand() > 0.6,
    },
    {
      id: "deluxe",
      name: "Deluxe Room with City View",
      description: "Spacious room with stunning city views and premium amenities.",
      maxGuests: 2,
      bedConfig: "1 King Bed",
      pricePerNight: Math.round(basePrice * 1.35),
      image: roomImages[1],
      amenities: ["Free WiFi", "Air Conditioning", "City View", "Mini Bar", "Coffee Maker"],
      refundable: rand() > 0.3,
      breakfastIncluded: true,
    },
    {
      id: "suite",
      name: "Executive Suite",
      description: "Luxurious suite with separate living area and exclusive perks.",
      maxGuests: 3,
      bedConfig: "1 King Bed + Sofa Bed",
      pricePerNight: Math.round(basePrice * 2.1),
      image: roomImages[2],
      amenities: ["Free WiFi", "Living Area", "Executive Lounge Access", "Butler Service", "Premium View"],
      refundable: true,
      breakfastIncluded: true,
    },
  ];
  return types;
}

export function generateHotels(params: HotelSearchParams): Hotel[] {
  const seed = seedFrom(
    `${params.location}${params.checkIn}${params.checkOut}${params.guests}`
  );
  const rand = mulberry32(seed);

  const hotels: Hotel[] = [];
  const count = 14 + Math.floor(rand() * 8);

  for (let i = 0; i < count; i++) {
    const prefix = hotelNamePool.prefixes[Math.floor(rand() * hotelNamePool.prefixes.length)];
    const suffix = hotelNamePool.suffixes[Math.floor(rand() * hotelNamePool.suffixes.length)];
    const cityName = params.location.split(",")[0].trim();
    const name = `${prefix} ${cityName} ${suffix}`.replace("The The", "The");
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`;

    const starRating = 2 + Math.floor(rand() * 4); // 2-5 stars
    const rating = 3.5 + rand() * 1.5; // 3.5-5.0
    const basePrice = 60 + starRating * 45 + Math.floor(rand() * 80);

    const images = getImagesForCity(cityName, rand, 6);
    const neighborhood = neighborhoodPool[Math.floor(rand() * neighborhoodPool.length)];
    const propertyType = (["hotel", "hotel", "hotel", "apartment", "resort", "villa", "hostel"] as const)[
      Math.floor(rand() * 7)
    ];

    // Pick 8-12 amenities
    const amenityCount = 8 + Math.floor(rand() * 5);
    const shuffledAmenities = shuffleDeterministic([...amenityPool], rand);
    const amenities = shuffledAmenities.slice(0, amenityCount);

    hotels.push({
      id: `hotel-${seed}-${i}`,
      name,
      slug,
      city: cityName,
      country: params.location.split(",")[1]?.trim() || "",
      address: `${Math.floor(rand() * 300) + 1} ${prefix} Street, ${cityName}`,
      rating: Math.round(rating * 10) / 10,
      starRating,
      reviewCount: 50 + Math.floor(rand() * 2000),
      pricePerNight: basePrice,
      currency: "USD",
      coverImage: images[0],
      images,
      description: `Experience the finest hospitality at ${name}. Located in the heart of ${cityName}'s ${neighborhood.toLowerCase()}, this ${starRating}-star property offers luxurious accommodations with modern amenities and exceptional service. Perfect for both leisure and business travelers seeking comfort and convenience.`,
      amenities,
      roomTypes: generateRoomTypes(basePrice, rand),
      policies: {
        checkIn: "15:00",
        checkOut: "11:00",
        cancellation: rand() > 0.5
          ? "Free cancellation until 48 hours before check-in"
          : "Non-refundable",
      },
      distanceFromCenter: Math.round(rand() * 80) / 10,
      propertyType,
      popularWith: ["Couples", "Business travelers", "Families"].filter(() => rand() > 0.4),
      neighborhood,
      latitude: 0,
      longitude: 0,
    });
  }

  return hotels.sort(
    (a, b) =>
      b.starRating - a.starRating ||
      b.rating - a.rating ||
      a.id.localeCompare(b.id)
  );
}

export function formatHotelPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
}
