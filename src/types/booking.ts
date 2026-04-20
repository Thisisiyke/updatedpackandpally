export interface Airport {
  code: string;
  city: string;
  country: string;
  name: string;
}

export interface Airline {
  code: string;
  name: string;
  logo: string;
}

export interface FlightSegment {
  airline: Airline;
  flightNumber: string;
  departure: { airport: Airport; time: string };
  arrival: { airport: Airport; time: string };
  duration: number; // minutes
  aircraft: string;
}

export interface Flight {
  id: string;
  segments: FlightSegment[];
  totalDuration: number; // minutes
  stops: number;
  price: number;
  currency: string;
  cabin: "economy" | "premium" | "business" | "first";
  refundable: boolean;
  baggage: { carryOn: boolean; checked: number };
  fareType: string;
  co2Kg: number;
}

export type CabinClass = "economy" | "premium" | "business" | "first";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  cabin: CabinClass;
  tripType: "oneway" | "roundtrip";
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  address: string;
  rating: number; // 1-5
  starRating: number; // 1-5
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  images: string[];
  coverImage: string;
  description: string;
  amenities: string[];
  roomTypes: RoomType[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
  distanceFromCenter: number; // km
  propertyType: "hotel" | "apartment" | "resort" | "villa" | "hostel";
  popularWith: string[];
  neighborhood: string;
  latitude: number;
  longitude: number;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  maxGuests: number;
  bedConfig: string;
  pricePerNight: number;
  image: string;
  amenities: string[];
  refundable: boolean;
  breakfastIncluded: boolean;
}

export interface HotelSearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface FlightBooking {
  type: "flight";
  flightId: string;
  flight: Flight;
  passengers: PassengerDetail[];
  totalPrice: number;
  bookingId: string;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
}

export interface HotelBooking {
  type: "hotel";
  hotelId: string;
  hotel: Hotel;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  bookingId: string;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
  guestDetail: GuestDetail;
}

export interface PassengerDetail {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dob: string;
  nationality: string;
  passportNumber?: string;
  type: "adult" | "child" | "infant";
}

export interface GuestDetail {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export type Booking = FlightBooking | HotelBooking;
