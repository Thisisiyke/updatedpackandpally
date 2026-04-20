"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles, ListChecks, MessageCircle, Mountain, Heart, Utensils, Camera, Waves, Palmtree, Tent, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomTabs } from "@/components/mobile/bottom-tabs";
import { MobileHeader } from "@/components/mobile/mobile-header";

const categories = [
  { label: "Adventure", icon: Mountain, color: "bg-orange-50 text-orange-600" },
  { label: "Wellness", icon: Heart, color: "bg-emerald-50 text-emerald-600" },
  { label: "Cultural", icon: Globe, color: "bg-blue-50 text-blue-600" },
  { label: "Culinary", icon: Utensils, color: "bg-amber-50 text-amber-600" },
  { label: "Beach", icon: Waves, color: "bg-cyan-50 text-cyan-600" },
  { label: "Photo", icon: Camera, color: "bg-violet-50 text-violet-600" },
  { label: "Tropical", icon: Palmtree, color: "bg-lime-50 text-lime-600" },
  { label: "Camping", icon: Tent, color: "bg-stone-50 text-stone-700" },
];

const aiTools = [
  {
    title: "AI Trip Generator",
    description: "Create custom itineraries",
    icon: Sparkles,
    bg: "from-violet-500 to-primary",
    href: "/mobile/ai/trip-generator",
  },
  {
    title: "Packing List",
    description: "Smart packing made easy",
    icon: ListChecks,
    bg: "from-emerald-500 to-teal-500",
    href: "/mobile/ai/packing-list",
  },
  {
    title: "Pally Chatbot",
    description: "Ask anything about travel",
    icon: MessageCircle,
    bg: "from-amber-500 to-orange-500",
    href: "/mobile/ai/chatbot",
  },
];

const inspirations = [
  { title: "Solo travelers", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" },
  { title: "Family getaways", image: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=600&q=80" },
  { title: "Luxury escapes", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80" },
  { title: "Budget adventures", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80" },
];

export default function MobileExplorePage() {
  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Explore" showBack={false} />

      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <div className="px-5 pt-2 pb-4 bg-white border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search destinations, experiences..."
              className="pl-9 h-11 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* AI tools */}
        <div className="px-5 mt-5">
          <h2 className="text-base font-bold mb-3">AI-powered</h2>
          <div className="space-y-2.5">
            {aiTools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${tool.bg} p-4 text-white shadow-sm`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
                  <tool.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{tool.title}</p>
                  <p className="text-xs text-white/80">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="px-5 mt-6">
          <h2 className="text-base font-bold mb-3">Browse by category</h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((c) => (
              <Link
                key={c.label}
                href="/mobile/search/trips"
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${c.color}`}
                >
                  <c.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-medium text-center">
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Inspiration */}
        <div className="px-5 mt-6 pb-6">
          <h2 className="text-base font-bold mb-3">Get inspired</h2>
          <div className="grid grid-cols-2 gap-3">
            {inspirations.map((i) => (
              <Link
                key={i.title}
                href="/mobile/search/trips"
                className="relative aspect-[4/5] rounded-2xl overflow-hidden"
              >
                <Image
                  src={i.image}
                  alt={i.title}
                  fill
                  className="object-cover"
                  sizes="170px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-sm font-bold leading-tight">{i.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}
