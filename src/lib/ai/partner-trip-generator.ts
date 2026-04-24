import { simulateDelay } from "./simulate-delay";

export interface PartnerTripInput {
  destination: string;
  country: string;
  durationDays: number;
  difficulty: "Easy" | "Moderate" | "Challenging";
  categories: string[];
  maxGroupSize: number;
  style?: string;
}

export interface GeneratedPartnerTrip {
  title: string;
  description: string;
  highlights: string[];
  itinerary: {
    id: string;
    title: string;
    description: string;
    activities: string[];
  }[];
  included: string[];
  notIncluded: string[];
  suggestedPrice: number;
}

// Pools of activity ideas keyed by category — picked in combination
const activityBank: Record<string, string[]> = {
  Cultural: [
    "Guided temple / heritage site tour",
    "Local museum & historical walk",
    "Traditional dance or music performance",
    "Hands-on artisan workshop",
    "Old town walking tour with historian",
  ],
  Adventure: [
    "Morning summit hike",
    "Zipline through the canopy",
    "White-water rafting descent",
    "Mountain biking route",
    "Canyoning expedition",
  ],
  Wellness: [
    "Sunrise yoga with panoramic views",
    "Guided meditation in nature",
    "Traditional spa treatment",
    "Breathwork & sound healing",
    "Forest bathing walk",
  ],
  Culinary: [
    "Cooking class with a local chef",
    "Street food walking tour",
    "Private winery & vineyard tasting",
    "Fresh market visit and shopping",
    "Multi-course tasting dinner",
  ],
  Trekking: [
    "Full-day guided trek",
    "Mountain refuge overnight",
    "Glacier approach hike",
    "Sunrise summit push",
    "Ridgeline panoramic walk",
  ],
  Safari: [
    "Sunrise game drive",
    "Bush walk with tracker",
    "Night safari (predator focus)",
    "Hide photography session",
    "Maasai / local community visit",
  ],
  Coastal: [
    "Private boat tour of hidden coves",
    "Snorkeling & paddleboarding",
    "Fishing village exploration",
    "Sunset aperitivo on the water",
    "Coastal hiking trail",
  ],
  Spiritual: [
    "Purification ritual at sacred site",
    "Zen meditation with a monk",
    "Temple stay experience",
    "Silent retreat morning",
    "Sacred chanting session",
  ],
  Historical: [
    "Guided archaeological site walk",
    "Ancient city & ruins exploration",
    "Castle / fortress tour",
    "Battlefield / heritage tour",
    "Library / museum deep dive",
  ],
  Beach: [
    "Beach yoga at sunrise",
    "Tropical cocktail class",
    "Catamaran day cruise",
    "Diving or snorkeling trip",
    "Beachfront barbecue dinner",
  ],
  Photography: [
    "Golden hour photo walk",
    "Portrait session with locals",
    "Drone aerial workshop",
    "Long exposure / astro session",
    "Print & editing masterclass",
  ],
};

const defaultActivities = [
  "Group welcome & orientation",
  "Scenic walk with your host",
  "Local café stop",
  "Free time to explore",
  "Group dinner at a favorite spot",
];

function pickActivities(categories: string[], count: number, rand: () => number): string[] {
  const pool = categories.flatMap((c) => activityBank[c] || []);
  const combined = pool.length ? [...pool, ...defaultActivities] : defaultActivities;
  const shuffled = [...combined].sort(() => rand() - 0.5);
  return shuffled.slice(0, count);
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

function seedFrom(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i);
  return h >>> 0;
}

function titleTemplate(input: PartnerTripInput, rand: () => number): string {
  const cat = input.categories[0] || "";
  const templates: Record<string, string[]> = {
    Cultural: [`Cultural Soul of ${input.destination}`, `${input.destination} Heritage Immersion`],
    Adventure: [`${input.destination} Adventure Expedition`, `Wild ${input.destination}`],
    Wellness: [`${input.destination} Wellness Retreat`, `Reset in ${input.destination}`],
    Culinary: [`Flavors of ${input.destination}`, `${input.destination} Culinary Escape`],
    Trekking: [`Trails of ${input.destination}`, `The ${input.destination} Trek`],
    Safari: [`${input.destination} Safari Experience`, `Wild ${input.destination}`],
    Coastal: [`Coastal Wonders of ${input.destination}`, `${input.destination} Seaside Escape`],
    Spiritual: [`Sacred ${input.destination}`, `Spiritual ${input.destination}`],
    Historical: [`Ancient ${input.destination}`, `Hidden Histories of ${input.destination}`],
    Beach: [`${input.destination} Beach Escape`, `Tropical ${input.destination}`],
    Photography: [`${input.destination} Through the Lens`, `Capturing ${input.destination}`],
  };
  const options = templates[cat] || [
    `Discover ${input.destination}`,
    `${input.destination} Adventure`,
  ];
  return options[Math.floor(rand() * options.length)];
}

const baseIncluded = [
  "Accommodation (twin share)",
  "Daily breakfast",
  "All activities listed in itinerary",
  "Local English-speaking guide",
  "Airport transfers on arrival/departure",
  "All transport during the trip",
  "Entrance fees to listed attractions",
  "Welcome & farewell dinner",
];

const baseNotIncluded = [
  "International flights",
  "Travel insurance (strongly recommended)",
  "Visa fees",
  "Most lunches & dinners",
  "Personal expenses",
  "Tips & gratuities",
  "Optional activities / upgrades",
  "Drinks and alcohol",
];

function pricingEstimate(input: PartnerTripInput, rand: () => number): number {
  const base = 180;
  const difficultyMult = {
    Easy: 1.0,
    Moderate: 1.25,
    Challenging: 1.55,
  }[input.difficulty];
  const premium = input.categories.some((c) =>
    ["Wellness", "Safari", "Photography", "Cultural"].includes(c)
  )
    ? 1.2
    : 1;
  const raw = base * input.durationDays * difficultyMult * premium * (0.9 + rand() * 0.3);
  // Round to nearest 49
  return Math.round(raw / 50) * 50 - 1;
}

export async function generatePartnerTrip(
  input: PartnerTripInput
): Promise<GeneratedPartnerTrip> {
  await simulateDelay(2200 + Math.random() * 1200);

  const seed = seedFrom(
    `${input.destination}${input.country}${input.durationDays}${input.difficulty}${input.categories.join(",")}`
  );
  const rand = mulberry32(seed);

  const title = titleTemplate(input, rand);

  const description = `A ${input.durationDays}-day ${input.difficulty.toLowerCase()} ${input.categories
    .join(" + ")
    .toLowerCase()} trip through ${input.destination}, ${input.country}. Led by a local host, this small-group adventure blends authentic experiences with breathtaking scenery. Perfect for travelers seeking ${
    input.categories.includes("Adventure") ? "thrills" : "meaningful connection"
  } alongside ${input.maxGroupSize - 1} like-minded companions.`;

  // Highlights — pull 4-5 standout moments
  const highlights = [
    `Full-day experience in ${input.destination}'s top spots`,
    `${input.categories[0] || "Cultural"} immersion with expert local guides`,
    `Small group of ${input.maxGroupSize} travelers for a personal feel`,
    input.difficulty === "Easy"
      ? "Relaxed pacing with plenty of free time"
      : "Carefully sequenced activities for all fitness levels",
    `Signature ${input.categories[0] || "culinary"} experience unique to the trip`,
  ].slice(0, 5);

  // Itinerary day-by-day
  const itinerary = Array.from({ length: input.durationDays }).map((_, i) => {
    const day = i + 1;
    const isFirst = day === 1;
    const isLast = day === input.durationDays;

    const title = isFirst
      ? `Arrival in ${input.destination}`
      : isLast
      ? "Farewell & Departure"
      : `Day ${day} — ${
          ["Exploration", "Immersion", "Adventure", "Highlights", "Discovery"][
            Math.floor(rand() * 5)
          ]
        }`;

    const description = isFirst
      ? `Welcome to ${input.destination}! After airport transfers and hotel check-in, we gather for a relaxed welcome dinner to get to know the group.`
      : isLast
      ? `A final morning together followed by departures. Optional activities available based on your flight time.`
      : `A full day of activities exploring ${input.destination}.`;

    const activities = isFirst
      ? ["Airport pickup", "Hotel check-in", "Welcome orientation", "Group dinner"]
      : isLast
      ? ["Final breakfast together", "Optional morning walk", "Airport transfers"]
      : pickActivities(input.categories, 3 + Math.floor(rand() * 2), rand);

    return {
      id: `d${day}`,
      title,
      description,
      activities,
    };
  });

  // Pick sensible defaults for included / not included
  const extraIncluded =
    input.categories.includes("Safari")
      ? ["Park entry fees", "Game drives with expert guide"]
      : input.categories.includes("Trekking")
      ? ["Camping equipment", "Porter support"]
      : input.categories.includes("Wellness")
      ? ["Spa treatment / massage", "Yoga & meditation sessions"]
      : [];
  const included = [...baseIncluded, ...extraIncluded].slice(0, 9);
  const notIncluded = baseNotIncluded.slice(0, 6);

  return {
    title,
    description,
    highlights,
    itinerary,
    included,
    notIncluded,
    suggestedPrice: pricingEstimate(input, rand),
  };
}
