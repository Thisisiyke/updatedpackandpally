interface ChatResponse {
  content: string;
  quickReplies?: string[];
}

const RESPONSE_MAP: Record<string, ChatResponse> = {
  bali: {
    content:
      "Bali is one of our most popular destinations! Known for its stunning temples, emerald rice terraces, and world-class surfing. We have wellness retreats starting from $2,199. The best time to visit is April-October during the dry season.",
    quickReplies: ["View Bali trips", "Bali packing tips", "Best time to visit"],
  },
  japan: {
    content:
      "Japan is a magical destination! We offer Sacred Temples of Kyoto trips covering ancient temples, tea ceremonies, and incredible food. Cherry blossom season (March-April) and autumn (Oct-Nov) are the most beautiful times to visit.",
    quickReplies: ["View Japan trips", "Japan visa info", "What to pack"],
  },
  italy: {
    content:
      "Italy's Amalfi Coast is one of our signature trips! Think cliffside villages, private boat tours, and cooking classes with local Nonnas. Trips start at $2,499 for 7 days. Summer is prime season but shoulder months offer fewer crowds.",
    quickReplies: ["View Italy trips", "Amalfi highlights", "Italy packing list"],
  },
  iceland: {
    content:
      "Iceland is pure magic — Northern Lights, ice caves, and hot springs! Our winter trips include glacier hiking and aurora hunting. Best for Northern Lights: September-March. Summer offers midnight sun and hiking.",
    quickReplies: ["View Iceland trips", "Northern Lights tips", "What to wear"],
  },
  visa: {
    content:
      "I can help with visa information! Here are some common destinations:\n\n• Thailand — Visa-free for 30 days (most passports)\n• Japan — Visa-free for 90 days\n• Indonesia/Bali — Visa on arrival, $35\n• EU/Schengen — Check if you need a Schengen visa\n• Peru — Visa-free for 183 days\n\nWhich country do you need specific info for?",
    quickReplies: ["Peru visa", "Schengen guide", "Tanzania visa"],
  },
  packing: {
    content:
      "Smart packing makes all the difference! Here are my top tips:\n\n1. Roll clothes instead of folding — saves 30% space\n2. Wear your heaviest shoes on the plane\n3. Pack a small daypack inside your main luggage\n4. Always carry a portable charger\n5. Bring a universal power adapter\n\nWant me to generate a custom packing list for your trip?",
    quickReplies: ["Generate packing list", "Carry-on only tips", "Tropical packing"],
  },
  budget: {
    content:
      "Great question! Our trips range from $1,899 to $4,299 per person, which typically includes accommodation, activities, and guided experiences. Tips to save:\n\n• Book early for early-bird discounts\n• Consider shoulder season trips\n• Group bookings (3+) get 10% off\n\nWhat budget range works for you?",
    quickReplies: ["Under $2,000", "$2,000-$3,000", "Luxury trips"],
  },
  weather: {
    content:
      "Weather varies hugely by destination! Here's a quick guide:\n\n🌴 Bali — Tropical, 27-30°C year-round. Dry: Apr-Oct\n🗻 Iceland — Cold! -1 to 13°C. Pack layers always\n☀️ Amalfi — Mediterranean, 20-30°C. Best: May-Sep\n🌿 Peru — Varies by altitude. Cusco: 5-20°C\n🦁 Tanzania — Warm, 20-30°C. Dry: Jun-Oct\n\nWhich destination are you interested in?",
    quickReplies: ["Bali weather", "Iceland weather", "Best time to travel"],
  },
  host: {
    content:
      "Interested in hosting? That's awesome! Pack & Pally hosts earn an average of $3,200 per trip. Here's what you need:\n\n• A passion for travel and people\n• Knowledge of your destination\n• Ability to plan and lead group experiences\n\nNo certifications needed for most trip types. Apply now and start creating adventures!",
    quickReplies: ["Apply to host", "Host earnings", "Host requirements"],
  },
  safari: {
    content:
      "Our Serengeti Safari Experience is legendary! 9 days of Big Five game drives, a hot air balloon ride, and sleeping under the stars. Led by our top-rated host Amara, a wildlife photographer with 8+ years of safari experience. Currently priced at $4,299.",
    quickReplies: ["View safari trip", "Safari packing list", "Best safari season"],
  },
  find: {
    content:
      "I'd love to help you find the perfect trip! To narrow it down, tell me:\n\n1. Where do you want to go? (or what type of experience)\n2. When are you thinking of traveling?\n3. What's your budget range?\n4. How many travelers?\n\nOr browse all our trips directly!",
    quickReplies: ["Browse all trips", "Adventure trips", "Cultural trips", "Wellness trips"],
  },
  hello: {
    content:
      "Hey there! Welcome to Pack & Pally! 👋 I'm Pally, your AI travel assistant. I can help you with:\n\n• Finding the perfect group trip\n• Destination information & tips\n• Visa requirements\n• Packing advice\n• Budget planning\n\nWhat would you like to explore?",
    quickReplies: ["Find a trip", "Packing tips", "Visa info"],
  },
  hi: {
    content:
      "Hey there! Welcome to Pack & Pally! 👋 I'm Pally, your AI travel assistant. I can help you with:\n\n• Finding the perfect group trip\n• Destination information & tips\n• Visa requirements\n• Packing advice\n• Budget planning\n\nWhat would you like to explore?",
    quickReplies: ["Find a trip", "Packing tips", "Visa info"],
  },
};

const FALLBACK: ChatResponse = {
  content:
    "That's a great question! While I might not have the specific answer right now, I can help with trip planning, destination info, packing tips, visa requirements, and budget advice. What would you like to explore?",
  quickReplies: ["Find a trip", "Packing tips", "Visa info", "Budget help"],
};

export function getMockResponse(input: string): ChatResponse {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(RESPONSE_MAP)) {
    if (lower.includes(key)) {
      return response;
    }
  }
  return FALLBACK;
}
