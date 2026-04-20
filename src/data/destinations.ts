export const continents = [
  "All",
  "Europe",
  "Asia",
  "Africa",
  "South America",
  "Oceania",
] as const;

export const difficulties = ["All", "Easy", "Moderate", "Challenging"] as const;

export const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $2,000", min: 0, max: 2000 },
  { label: "$2,000 - $3,000", min: 2000, max: 3000 },
  { label: "$3,000 - $4,000", min: 3000, max: 4000 },
  { label: "$4,000+", min: 4000, max: Infinity },
] as const;

export const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
  { label: "Duration", value: "duration" },
] as const;

export const popularDestinations = [
  "Bali, Indonesia",
  "Kyoto, Japan",
  "Amalfi Coast, Italy",
  "Machu Picchu, Peru",
  "Serengeti, Tanzania",
  "Iceland",
  "Patagonia, Chile",
  "Morocco",
  "New Zealand",
  "Portugal",
  "Norway",
  "Colombia",
  "Santorini, Greece",
  "Cape Town, South Africa",
  "Maldives",
];
