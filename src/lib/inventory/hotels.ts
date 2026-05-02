/**
 * Hotel inventory facade. Swap `generateHotels` for a provider-backed
 * BFF implementation when a vendor is selected.
 */
export {
  generateHotels,
  formatHotelPrice,
  calculateNights,
} from "@/lib/hotel-generator";
