export const siteConfig = {
  name: "Pack & Pally",
  description:
    "Connect with fellow travelers and join curated group adventures around the world.",
  url: "https://packandpally.com",
};

/**
 * Feature flags. Inventory for properties / rooms / flights will be sourced
 * from third-party providers (Booking, Amadeus/Duffel, etc.) once integrations
 * land. Until then, host-side management UI for those inventories is hidden,
 * and the public-facing routes show a "Coming soon — provider-powered" demo
 * placeholder.
 */
export const FEATURE_FLAGS = {
  /** Host can create / edit individual property + room listings. */
  hostPropertyListings: false,
  /** Host can manage flight inventory directly. */
  hostFlightListings: false,
  /** Public flight search is live (third-party powered). */
  publicFlightSearch: false,
  /** Public hotel search is live (third-party powered). */
  publicHotelSearch: false,
} as const;

export const PROVIDER_NAMES = {
  hotels: "Booking.com",
  flights: "Duffel",
} as const;

export const navLinks = [
  ...(FEATURE_FLAGS.publicFlightSearch
    ? [{ label: "Flights", href: "/flights" }]
    : []),
  ...(FEATURE_FLAGS.publicHotelSearch
    ? [{ label: "Hotels", href: "/hotels" }]
    : []),
  { label: "Group Trips", href: "/browse-trips" },
  { label: "AI Features", href: "/ai-features" },
  { label: "Become a Host", href: "/become-a-host" },
  { label: "FAQ", href: "/faq" },
];

export const footerLinks = {
  explore: [
    ...(FEATURE_FLAGS.publicFlightSearch
      ? [{ label: "Flights", href: "/flights" }]
      : []),
    ...(FEATURE_FLAGS.publicHotelSearch
      ? [{ label: "Hotels", href: "/hotels" }]
      : []),
    { label: "Group Trips", href: "/browse-trips" },
    { label: "AI Features", href: "/ai-features" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Become a Host", href: "/become-a-host" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Get the app", href: "/#get-the-app" },
    { label: "Contact Us", href: "mailto:support@packandpally.com" },
    { label: "Safety", href: "#" },
  ],
};

export const stats = [
  { value: "4,000+", label: "Travelers" },
  { value: "200+", label: "Trips Completed" },
  { value: "50+", label: "Countries" },
  { value: "4.9", label: "Avg Rating" },
];
