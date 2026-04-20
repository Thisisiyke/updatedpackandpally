import { Flight, FlightSegment, Airport, FlightSearchParams } from "@/types/booking";
import { airports, airlines } from "@/data/airports";

// Pseudo-random generator with seed for deterministic results
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

export function getAirportByCode(code: string): Airport | undefined {
  return airports.find((a) => a.code === code);
}

export function findAirportByCityOrCode(query: string): Airport | undefined {
  const q = query.toLowerCase();
  return airports.find(
    (a) =>
      a.code.toLowerCase() === q ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
  );
}

function formatTime(hour: number, min: number): string {
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor((total % (24 * 60)) / 60);
  const newM = total % 60;
  return formatTime(newH, newM);
}

function haversineDistance(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const A =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(A));
}

// Rough approximation of airport coordinates for duration calculation
const airportCoords: Record<string, { lat: number; lon: number }> = {
  JFK: { lat: 40.6413, lon: -73.7781 }, LAX: { lat: 33.9416, lon: -118.4085 },
  SFO: { lat: 37.6213, lon: -122.379 }, ORD: { lat: 41.9742, lon: -87.9073 },
  MIA: { lat: 25.7959, lon: -80.287 }, BOS: { lat: 42.3656, lon: -71.0096 },
  SEA: { lat: 47.4502, lon: -122.3088 }, DEN: { lat: 39.8561, lon: -104.6737 },
  LHR: { lat: 51.47, lon: -0.4543 }, CDG: { lat: 49.0097, lon: 2.5479 },
  FRA: { lat: 50.0379, lon: 8.5622 }, AMS: { lat: 52.3105, lon: 4.7683 },
  BCN: { lat: 41.2974, lon: 2.0833 }, MAD: { lat: 40.4983, lon: -3.5676 },
  FCO: { lat: 41.8003, lon: 12.2389 }, MUC: { lat: 48.3537, lon: 11.7751 },
  ZRH: { lat: 47.4647, lon: 8.5492 }, CPH: { lat: 55.6179, lon: 12.656 },
  LIS: { lat: 38.7742, lon: -9.1342 }, ATH: { lat: 37.9364, lon: 23.9445 },
  IST: { lat: 41.2753, lon: 28.7519 }, DXB: { lat: 25.2532, lon: 55.3657 },
  DOH: { lat: 25.2609, lon: 51.6138 }, HND: { lat: 35.5494, lon: 139.7798 },
  NRT: { lat: 35.772, lon: 140.3929 }, ICN: { lat: 37.4602, lon: 126.4407 },
  SIN: { lat: 1.3644, lon: 103.9915 }, HKG: { lat: 22.308, lon: 113.9185 },
  BKK: { lat: 13.69, lon: 100.7501 }, DPS: { lat: -8.7467, lon: 115.167 },
  SYD: { lat: -33.9399, lon: 151.1753 }, AKL: { lat: -37.0082, lon: 174.785 },
  YYZ: { lat: 43.6777, lon: -79.6248 }, YVR: { lat: 49.1967, lon: -123.1815 },
  MEX: { lat: 19.4361, lon: -99.0719 }, GRU: { lat: -23.4356, lon: -46.4731 },
  EZE: { lat: -34.8222, lon: -58.5358 }, LIM: { lat: -12.0219, lon: -77.1143 },
  CPT: { lat: -33.9715, lon: 18.6021 }, JNB: { lat: -26.1367, lon: 28.2411 },
  CAI: { lat: 30.1219, lon: 31.4056 }, NBO: { lat: -1.3192, lon: 36.9278 },
  CMN: { lat: 33.3675, lon: -7.5899 }, DEL: { lat: 28.5562, lon: 77.1 },
  BOM: { lat: 19.0896, lon: 72.8656 },
};

function calculateFlightDuration(origin: string, dest: string): number {
  const a = airportCoords[origin];
  const b = airportCoords[dest];
  if (!a || !b) return 180;
  const distance = haversineDistance(a, b);
  // ~800km/h avg with 30min taxi/takeoff/landing
  return Math.round((distance / 800) * 60 + 30);
}

export function generateFlights(params: FlightSearchParams): Flight[] {
  const originAirport = findAirportByCityOrCode(params.origin);
  const destAirport = findAirportByCityOrCode(params.destination);

  if (!originAirport || !destAirport) return [];

  const seed = seedFrom(
    `${params.origin}${params.destination}${params.departDate}${params.cabin}`
  );
  const rand = mulberry32(seed);

  const baseDuration = calculateFlightDuration(
    originAirport.code,
    destAirport.code
  );

  const cabinMultiplier = {
    economy: 1,
    premium: 1.8,
    business: 3.5,
    first: 6,
  }[params.cabin];

  const flights: Flight[] = [];

  // Generate 12-16 flight options
  const count = 12 + Math.floor(rand() * 5);

  for (let i = 0; i < count; i++) {
    const airline = airlines[Math.floor(rand() * airlines.length)];
    const departHour = Math.floor(rand() * 24);
    const departMin = Math.floor(rand() * 60);
    const stops = rand() < 0.45 ? 0 : rand() < 0.85 ? 1 : 2;

    // Base price varies by distance, airline, cabin
    const basePrice =
      (100 + baseDuration * 0.8) *
      cabinMultiplier *
      (0.75 + rand() * 0.8) *
      params.passengers;
    const price = Math.round(basePrice);

    const segments: FlightSegment[] = [];

    if (stops === 0) {
      const departTime = formatTime(departHour, departMin);
      const arrivalTime = addMinutes(departTime, baseDuration);
      segments.push({
        airline,
        flightNumber: `${airline.code}${100 + Math.floor(rand() * 900)}`,
        departure: { airport: originAirport, time: departTime },
        arrival: { airport: destAirport, time: arrivalTime },
        duration: baseDuration,
        aircraft: ["Boeing 737", "Airbus A320", "Boeing 777", "Airbus A350"][
          Math.floor(rand() * 4)
        ],
      });
    } else {
      // Pick a layover airport
      const layoverCandidates = airports.filter(
        (a) => a.code !== originAirport.code && a.code !== destAirport.code
      );
      const layoverAirport =
        layoverCandidates[Math.floor(rand() * layoverCandidates.length)];

      const leg1Duration = Math.round(baseDuration * 0.5);
      const leg2Duration = Math.round(baseDuration * 0.6);
      const layoverDuration = 60 + Math.floor(rand() * 180); // 60-240 min

      const departTime = formatTime(departHour, departMin);
      const leg1ArrivalTime = addMinutes(departTime, leg1Duration);
      const leg2DepartTime = addMinutes(leg1ArrivalTime, layoverDuration);
      const leg2ArrivalTime = addMinutes(leg2DepartTime, leg2Duration);

      segments.push({
        airline,
        flightNumber: `${airline.code}${100 + Math.floor(rand() * 900)}`,
        departure: { airport: originAirport, time: departTime },
        arrival: { airport: layoverAirport, time: leg1ArrivalTime },
        duration: leg1Duration,
        aircraft: ["Boeing 737", "Airbus A320"][Math.floor(rand() * 2)],
      });

      segments.push({
        airline,
        flightNumber: `${airline.code}${100 + Math.floor(rand() * 900)}`,
        departure: { airport: layoverAirport, time: leg2DepartTime },
        arrival: { airport: destAirport, time: leg2ArrivalTime },
        duration: leg2Duration,
        aircraft: ["Boeing 737", "Airbus A320", "Boeing 777"][
          Math.floor(rand() * 3)
        ],
      });
    }

    const totalDuration =
      segments.reduce((s, seg) => s + seg.duration, 0) +
      (stops > 0 ? 120 : 0); // add avg layover

    flights.push({
      id: `flight-${seed}-${i}`,
      segments,
      totalDuration,
      stops,
      price,
      currency: "USD",
      cabin: params.cabin,
      refundable: rand() > 0.6,
      baggage: {
        carryOn: true,
        checked: params.cabin === "economy" ? (rand() > 0.5 ? 1 : 0) : 2,
      },
      fareType:
        params.cabin === "economy"
          ? ["Basic", "Standard", "Flex"][Math.floor(rand() * 3)]
          : "Standard",
      co2Kg: Math.round((baseDuration / 60) * 90),
    });
  }

  return flights.sort((a, b) => a.price - b.price);
}

export function getFlightById(id: string): Flight | null {
  // ID format: flight-{seed}-{index}
  // We can't fully reconstruct without params, but we can attempt via localStorage or URL params
  // For this demo, the detail page will pass params to regenerate
  return null;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
