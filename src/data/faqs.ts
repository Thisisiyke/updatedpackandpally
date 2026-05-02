export interface FaqEntry {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqEntry[];
}

export const faqGroups: FaqGroup[] = [
  {
    title: "Booking & joining trips",
    items: [
      {
        q: "How do I join a group trip?",
        a: "Browse trips on the home or Browse Trips page, open one you like, and tap Join. You'll review the host's terms and cancellation policy, choose how many travelers, then check out — pay in full or place a 30% deposit and finish up before the trip starts.",
      },
      {
        q: "Can I bring a friend with me on a group trip?",
        a: "Yes. At checkout you can add up to the number of spots remaining. If the host has set a tiered group rate, the per-person price drops as you bring more travelers.",
      },
      {
        q: "How does the partial-payment deposit work?",
        a: "Choose Pay deposit at checkout to put down 30% now and have the remainder due 30 days before the trip starts. Your spot is held the moment the deposit clears. Hosts can send you reminders by email, SMS, or in-app push as the date approaches.",
      },
      {
        q: "What does the price breakdown include?",
        a: "Subtotal × travelers, then tax (set per-trip by the host, default 8.25%), and Pack & Pally's 3% platform fee. The full breakdown is shown on the trip page and again at checkout — no surprises.",
      },
      {
        q: "Will I be added to a group chat after I book?",
        a: "Yes. Once you join a trip, you're automatically added to that trip's group chat where the host coordinates with everyone. You can also chat 1:1 with the host from the same Messages tab.",
      },
    ],
  },
  {
    title: "Hosting on Pack & Pally",
    items: [
      {
        q: "How do I become a host?",
        a: "Tap Become a Host (or Apply to Host on the host landing page). You'll be guided through Stripe Connect onboarding to verify your identity and add your bank — Stripe handles all of the paperwork. Once connected, you can create trips on web or mobile.",
      },
      {
        q: "How much does it cost to host?",
        a: "Listing is free. Pack & Pally takes a 3% platform fee on each booking, applied automatically and shown to travelers in the price breakdown.",
      },
      {
        q: "How and when do I get paid?",
        a: "Payouts are sent to the bank account you connected through Stripe within 48 hours of each trip ending. You can see lifetime earnings, outstanding balances, and your next payout date on the Payments tab in the host app.",
      },
      {
        q: "Can I create and manage trips from my phone?",
        a: "Fully — the mobile host portal supports the entire trip lifecycle: create with AI assistance, edit every field, manage travelers, send reminders, see survey results, and message your group. Anything you can do on web, you can do on mobile.",
      },
      {
        q: "Can I set different prices for solo vs. group bookings?",
        a: "Yes. When creating a trip, switch the Pricing card from Flat to Tiered to set per-person rates for solo, couple, and group of 3+ travelers. The discounted rate auto-applies to everyone in the group as it grows.",
      },
      {
        q: "Can I send my own terms and cancellation policy?",
        a: "Yes. Hosts can publish a custom T&C and pick a cancellation policy preset (Flexible / Moderate / Strict / Custom) from the partner Settings. Travelers must accept these before booking, and your cancellation rules are surfaced as a separate document on the trip page.",
      },
      {
        q: "Can I send payment reminders to travelers who've paid only a deposit?",
        a: "Yes. From a trip's Travelers tab you can send reminders by email, SMS, or in-app push to one or all partial-payment travelers. Each send is logged with the message and recipients so you can resend later.",
      },
    ],
  },
  {
    title: "Cancellations & refunds",
    items: [
      {
        q: "What's the default cancellation policy?",
        a: "Each host sets one of three presets — Flexible (full refund 7+ days out), Moderate (full refund 30+ days out), or Strict (full refund 60+ days out) — or writes a custom one. The exact refund windows are shown on the trip page and in the cancellation modal before you book.",
      },
      {
        q: "How do I cancel my booking?",
        a: "Go to your trip's booking page in the My Trips tab and tap Cancel. The refund amount is calculated automatically based on the host's policy and how close it is to the trip start date. Refunds go back to your original payment method within 5–10 business days.",
      },
      {
        q: "What happens if the host cancels?",
        a: "You're refunded in full and removed from the trip's group chat. Pack & Pally's support team will help re-book or recommend similar trips.",
      },
    ],
  },
  {
    title: "AI features",
    items: [
      {
        q: "What can the AI do for travelers?",
        a: "Pack & Pally's AI helps you generate full trip itineraries from a few prompts, build a packing list tailored to your destination and activities, and answers questions through Pally — your in-app travel chatbot.",
      },
      {
        q: "What does the post-trip AI survey do for hosts?",
        a: "When enabled per trip, the AI sends travelers a short tailored survey 24 hours after the trip ends. Responses are aggregated into a sentiment breakdown, top-praised highlights, and improvement suggestions you can act on for the next trip.",
      },
      {
        q: "Are AI-generated itineraries editable?",
        a: "Yes. Whether AI-generated by a host or a traveler, every itinerary is fully editable day-by-day before publishing or sharing.",
      },
    ],
  },
  {
    title: "App, account & support",
    items: [
      {
        q: "Is there an iOS / Android app?",
        a: "We're rolling out native apps for iPhone and Android. Use the Get the app section on the home page to be notified or download once available.",
      },
      {
        q: "How do I switch between traveler and host modes?",
        a: "On mobile, open Profile and tap Switch to host (or Switch to traveler if you're in host mode). All your trips, messages, and bookings stay accessible across both views.",
      },
      {
        q: "Is my payment information secure?",
        a: "All payments are processed through Stripe. Pack & Pally never stores raw card or bank details — Stripe handles encryption, identity verification, and PCI compliance.",
      },
      {
        q: "How do I contact support?",
        a: "Pack & Pally has a 24/7 support team available through the in-app chat or at support@packandpally.com. For urgent on-trip issues, call the emergency line printed on your booking confirmation.",
      },
    ],
  },
];

/** Top FAQs surfaced on the landing page (~6 across categories). */
export const topFaqs: FaqEntry[] = [
  faqGroups[0].items[0],
  faqGroups[0].items[2],
  faqGroups[1].items[0],
  faqGroups[1].items[2],
  faqGroups[2].items[0],
  faqGroups[4].items[0],
];
