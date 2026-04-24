import type { Participant } from "@/types/messaging";

/**
 * An "activity" is a user-authored pin on the neighborhood map: a casual
 * meetup that other travelers can join. Positions are stored as percentages
 * (0-100) of the stylized map viewport — no real lat/lng.
 */
export interface Activity {
  id: string;
  creator: Participant;
  title: string;
  description?: string;
  /** One of emoji or image is set. Image is a dataURL or https URL. */
  emoji?: string;
  image?: string;
  locationLabel: string;
  x: number; // 0-100 (percent of map width)
  y: number; // 0-100 (percent of map height)
  startsAt: string; // ISO
  duration: string; // "2 hours", "All evening", etc.
  capacity?: number;
  /** Array of participant ids (including creator). */
  participantIds: string[];
  /** Linked conversation id once anyone has joined. */
  conversationId?: string;
  createdAt: string;
}

function iso(hoursAhead: number) {
  return new Date(Date.now() + hoursAhead * 60 * 60_000).toISOString();
}

function createdAgo(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

const seedCreators: Participant[] = [
  {
    id: "t-emily",
    name: "Emily Chen",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    role: "traveler",
  },
  {
    id: "t-diego",
    name: "Diego Navarro",
    avatar: "https://randomuser.me/api/portraits/men/28.jpg",
    role: "traveler",
  },
  {
    id: "t-oliver",
    name: "Oliver Berg",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    role: "traveler",
  },
  {
    id: "t-hannah",
    name: "Hannah Johansson",
    avatar: "https://randomuser.me/api/portraits/women/19.jpg",
    role: "traveler",
  },
  {
    id: "t-ryan",
    name: "Ryan Cooper",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    role: "traveler",
  },
  {
    id: "t-sarah",
    name: "Sarah Mitchell",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    role: "traveler",
  },
];

export const seedActivities: Activity[] = [
  {
    id: "act-1",
    creator: seedCreators[0],
    title: "Sunset picnic at Marina",
    description:
      "Bringing a blanket, some wine, and cheese. Come hang for golden hour!",
    emoji: "🧺",
    locationLabel: "Marina Green",
    x: 22,
    y: 38,
    startsAt: iso(2),
    duration: "2 hours",
    capacity: 8,
    participantIds: ["t-emily"],
    createdAt: createdAgo(35),
  },
  {
    id: "act-2",
    creator: seedCreators[1],
    title: "Ramen + karaoke crawl",
    description: "Meeting at Menya then hitting Voicebox. Low-key fun night.",
    emoji: "🍜",
    locationLabel: "Japantown",
    x: 61,
    y: 30,
    startsAt: iso(5),
    duration: "All evening",
    capacity: 6,
    participantIds: ["t-diego", "t-ryan"],
    createdAt: createdAgo(90),
  },
  {
    id: "act-3",
    creator: seedCreators[2],
    title: "Morning run — Lands End loop",
    description: "Easy 6k along the coast. We go slow and stop for photos.",
    emoji: "🏃‍♂️",
    locationLabel: "Lands End",
    x: 12,
    y: 20,
    startsAt: iso(16),
    duration: "1 hour",
    capacity: 10,
    participantIds: ["t-oliver", "t-sarah", "t-hannah"],
    createdAt: createdAgo(180),
  },
  {
    id: "act-4",
    creator: seedCreators[3],
    title: "Pottery studio drop-in",
    description:
      "Open studio tonight. No experience needed, tools provided. $15 materials.",
    image:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80",
    locationLabel: "Mission Ceramics",
    x: 52,
    y: 66,
    startsAt: iso(6),
    duration: "3 hours",
    capacity: 5,
    participantIds: ["t-hannah"],
    createdAt: createdAgo(60),
  },
  {
    id: "act-5",
    creator: seedCreators[4],
    title: "Chess in the park",
    description:
      "Outdoor tables. Bring your own board or use theirs. All levels welcome.",
    emoji: "♟️",
    locationLabel: "Dolores Park",
    x: 44,
    y: 52,
    startsAt: iso(3),
    duration: "2 hours",
    participantIds: ["t-ryan"],
    createdAt: createdAgo(25),
  },
  {
    id: "act-6",
    creator: seedCreators[5],
    title: "Farmers market wander",
    description: "Ferry Building market. Tasting our way through.",
    emoji: "🥖",
    locationLabel: "Ferry Building",
    x: 78,
    y: 44,
    startsAt: iso(20),
    duration: "2 hours",
    capacity: 6,
    participantIds: ["t-sarah"],
    createdAt: createdAgo(300),
  },
  {
    id: "act-7",
    creator: seedCreators[0],
    title: "Yoga on the roof",
    emoji: "🧘‍♀️",
    locationLabel: "Hayes Valley rooftop",
    x: 38,
    y: 72,
    startsAt: iso(12),
    duration: "1 hour",
    capacity: 12,
    participantIds: ["t-emily", "t-hannah"],
    createdAt: createdAgo(410),
  },
  {
    id: "act-8",
    creator: seedCreators[2],
    title: "Beach bonfire + s'mores",
    description:
      "Meet at the fire ring closest to the parking lot. Bring a layer, it gets cold.",
    emoji: "🔥",
    locationLabel: "Ocean Beach",
    x: 8,
    y: 82,
    startsAt: iso(9),
    duration: "3 hours",
    capacity: 15,
    participantIds: ["t-oliver", "t-diego"],
    createdAt: createdAgo(120),
  },
];

export const STORAGE_KEY_ACTIVITIES = "packpally_activities";
export const ACTIVITIES_CHANGE_EVENT = "packpally_activities_change";

export function loadActivities(): Activity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seedActivities;
}

export function saveActivities(activities: Activity[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
    window.dispatchEvent(new CustomEvent(ACTIVITIES_CHANGE_EVENT));
  } catch {}
}
