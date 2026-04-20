import type { Conversation, Message, Participant } from "@/types/messaging";

// Pretend the currently-logged-in user is this person on mobile/dashboard
export const CURRENT_USER: Participant = {
  id: "me",
  name: "Explorer",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  role: "traveler",
};

// And this is the currently-logged-in partner on the partner portal
export const CURRENT_PARTNER: Participant = {
  id: "partner-me",
  name: "Sofia Martinez",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  role: "partner",
  online: true,
};

// Hosts / partners the current user is talking to
const hosts: Participant[] = [
  {
    id: "h-sofia",
    name: "Sofia Martinez",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "host",
    online: true,
  },
  {
    id: "h-kenji",
    name: "Kenji Tanaka",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "host",
    online: false,
  },
  {
    id: "h-amara",
    name: "Amara Okafor",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    role: "host",
    online: true,
  },
  {
    id: "h-priya",
    name: "Priya Sharma",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    role: "host",
    online: false,
  },
];

// Travelers the current partner is talking to
const travelers: Participant[] = [
  {
    id: "t-emily",
    name: "Emily Chen",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    role: "traveler",
    online: true,
  },
  {
    id: "t-james",
    name: "James Whitfield",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    role: "traveler",
    online: false,
  },
  {
    id: "t-diego",
    name: "Diego Navarro",
    avatar: "https://randomuser.me/api/portraits/men/28.jpg",
    role: "traveler",
    online: true,
  },
  {
    id: "t-aisha",
    name: "Aisha Patel",
    avatar: "https://randomuser.me/api/portraits/women/56.jpg",
    role: "traveler",
    online: false,
  },
];

function iso(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

// ── User-facing conversations (seen on mobile + dashboard) ──
export const userConversations: Conversation[] = [
  {
    id: "c-user-1",
    participants: [CURRENT_USER, hosts[0]],
    tripTitle: "Coastal Wonders of Amalfi",
    tripImage:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80",
    lastMessage: "Looking forward to meeting you in Positano!",
    lastMessageAt: iso(12),
    lastSenderId: "h-sofia",
    unreadCount: 2,
  },
  {
    id: "c-user-2",
    participants: [CURRENT_USER, hosts[2]],
    tripTitle: "Serengeti Safari Experience",
    tripImage:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&q=80",
    lastMessage: "Just sent the packing list as promised 🦁",
    lastMessageAt: iso(180),
    lastSenderId: "h-amara",
    unreadCount: 1,
  },
  {
    id: "c-user-3",
    participants: [CURRENT_USER, hosts[1]],
    tripTitle: "Sacred Temples of Kyoto",
    tripImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80",
    lastMessage: "You: Thanks, see you next month!",
    lastMessageAt: iso(60 * 24),
    lastSenderId: "me",
    unreadCount: 0,
  },
  {
    id: "c-user-4",
    participants: [CURRENT_USER, hosts[3]],
    tripTitle: "Bali Wellness Retreat",
    tripImage:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
    lastMessage: "What time should we arrive on day 1?",
    lastMessageAt: iso(60 * 30),
    lastSenderId: "me",
    unreadCount: 0,
  },
];

// ── Partner-facing conversations (seen in partner portal) ──
export const partnerConversations: Conversation[] = [
  {
    id: "c-partner-1",
    participants: [CURRENT_PARTNER, travelers[0]],
    tripTitle: "Coastal Wonders of Amalfi",
    tripImage:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80",
    lastMessage: "Can't wait! What should I bring for the boat day?",
    lastMessageAt: iso(8),
    lastSenderId: "t-emily",
    unreadCount: 3,
  },
  {
    id: "c-partner-2",
    participants: [CURRENT_PARTNER, travelers[1]],
    tripTitle: "Coastal Wonders of Amalfi",
    tripImage:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80",
    lastMessage: "You: See you in Sorrento on the 15th!",
    lastMessageAt: iso(45),
    lastSenderId: "partner-me",
    unreadCount: 0,
  },
  {
    id: "c-partner-3",
    participants: [CURRENT_PARTNER, travelers[2]],
    tripTitle: "Morocco Desert Adventure",
    tripImage:
      "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400&q=80",
    lastMessage: "Is the desert camp pet-friendly?",
    lastMessageAt: iso(240),
    lastSenderId: "t-diego",
    unreadCount: 1,
  },
  {
    id: "c-partner-4",
    participants: [CURRENT_PARTNER, travelers[3]],
    tripTitle: "Coastal Wonders of Amalfi",
    tripImage:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80",
    lastMessage: "Thanks for the recommendations!",
    lastMessageAt: iso(60 * 48),
    lastSenderId: "t-aisha",
    unreadCount: 0,
  },
];

// ── Seed messages per conversation ──
const mk = (id: string, convId: string, senderId: string, text: string, minutesAgo: number, read = true): Message => ({
  id,
  conversationId: convId,
  senderId,
  text,
  createdAt: iso(minutesAgo),
  read,
});

export const seedMessages: Record<string, Message[]> = {
  "c-user-1": [
    mk("m1-1", "c-user-1", "h-sofia", "Hi Explorer! I'm Sofia, your host for the Amalfi trip. Just wanted to say hello 👋", 60 * 24 * 2),
    mk("m1-2", "c-user-1", "me", "Hi Sofia! So excited to join this trip.", 60 * 24 * 2 - 30),
    mk("m1-3", "c-user-1", "h-sofia", "Wonderful! A few things to prepare — comfortable walking shoes are a must, and bring a light jacket for evenings.", 60 * 24),
    mk("m1-4", "c-user-1", "me", "Noted! How's the weather looking?", 60 * 20),
    mk("m1-5", "c-user-1", "h-sofia", "Sunny and 25°C most days. Perfect weather 🌤️", 60 * 18),
    mk("m1-6", "c-user-1", "h-sofia", "I just added a new spot to our itinerary — a private cove for swimming on day 4.", 30, false),
    mk("m1-7", "c-user-1", "h-sofia", "Looking forward to meeting you in Positano!", 12, false),
  ],
  "c-user-2": [
    mk("m2-1", "c-user-2", "h-amara", "Hi! Welcome to the Serengeti trip. I've sent your pre-arrival info to your email.", 60 * 24 * 3),
    mk("m2-2", "c-user-2", "me", "Got it! Any specific camera gear recommendations?", 60 * 24 * 3 - 60),
    mk("m2-3", "c-user-2", "h-amara", "A 70-200mm lens is ideal. I'll also bring extra gear you can borrow.", 60 * 24 * 2),
    mk("m2-4", "c-user-2", "h-amara", "Just sent the packing list as promised 🦁", 180, false),
  ],
  "c-user-3": [
    mk("m3-1", "c-user-3", "h-kenji", "Welcome to Kyoto! Looking forward to showing you the temples.", 60 * 24 * 5),
    mk("m3-2", "c-user-3", "me", "Thanks, see you next month!", 60 * 24),
  ],
  "c-user-4": [
    mk("m4-1", "c-user-4", "h-priya", "Hi Explorer! Ready to reconnect in Ubud?", 60 * 24 * 4),
    mk("m4-2", "c-user-4", "me", "Yes! Can't wait. Quick question:", 60 * 30 - 2),
    mk("m4-3", "c-user-4", "me", "What time should we arrive on day 1?", 60 * 30),
  ],
  "c-partner-1": [
    mk("p1-1", "c-partner-1", "partner-me", "Hi Emily! Just confirming your spot on the Amalfi trip. Any questions ahead of the trip?", 60 * 24 * 2),
    mk("p1-2", "c-partner-1", "t-emily", "Hi Sofia! All good. Super excited!", 60 * 24 * 2 - 45),
    mk("p1-3", "c-partner-1", "partner-me", "Awesome. Remember the Path of the Gods hike needs sturdy shoes.", 60 * 24),
    mk("p1-4", "c-partner-1", "t-emily", "Got it 👍", 60 * 20),
    mk("p1-5", "c-partner-1", "t-emily", "Can't wait! What should I bring for the boat day?", 8, false),
  ],
  "c-partner-2": [
    mk("p2-1", "c-partner-2", "t-james", "Hi Sofia, quick question about arrival times", 60 * 24),
    mk("p2-2", "c-partner-2", "partner-me", "Hi James! Pickup is 2 PM at Naples Airport on day 1.", 60 * 12),
    mk("p2-3", "c-partner-2", "t-james", "Perfect, thank you!", 60 * 2),
    mk("p2-4", "c-partner-2", "partner-me", "See you in Sorrento on the 15th!", 45),
  ],
  "c-partner-3": [
    mk("p3-1", "c-partner-3", "t-diego", "Hello! Just booked the Morocco trip.", 60 * 24 * 3),
    mk("p3-2", "c-partner-3", "partner-me", "Amazing, welcome! Let me know if you have any questions.", 60 * 24 * 2),
    mk("p3-3", "c-partner-3", "t-diego", "Is the desert camp pet-friendly?", 240, false),
  ],
  "c-partner-4": [
    mk("p4-1", "c-partner-4", "partner-me", "Welcome Aisha! Sending you a few local restaurant recs.", 60 * 48 * 2),
    mk("p4-2", "c-partner-4", "t-aisha", "Thanks for the recommendations!", 60 * 48),
  ],
};

export { hosts, travelers };
