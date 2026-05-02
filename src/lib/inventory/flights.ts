/**
 * Flight inventory facade. Swap `generateFlights` for a provider-backed
 * implementation without touching feature code.
 */
export {
  generateFlights,
  formatDuration,
  formatPrice,
} from "@/lib/flight-generator";
