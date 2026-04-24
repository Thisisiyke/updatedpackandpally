import { PackingList, PackingCategory } from "@/types";
import { simulateDelay } from "./simulate-delay";

const BASE_DOCUMENTS: PackingCategory = {
  name: "Documents",
  icon: "FileText",
  items: [
    { id: "doc-1", name: "Passport", quantity: 1, checked: false, isCustom: false },
    { id: "doc-2", name: "Travel insurance documents", quantity: 1, checked: false, isCustom: false },
    { id: "doc-3", name: "Boarding passes", quantity: 1, checked: false, isCustom: false },
    { id: "doc-4", name: "Hotel confirmations", quantity: 1, checked: false, isCustom: false },
    { id: "doc-5", name: "Copies of ID (digital + physical)", quantity: 1, checked: false, isCustom: false },
    { id: "doc-6", name: "Emergency contact list", quantity: 1, checked: false, isCustom: false },
  ],
};

const BASE_ELECTRONICS: PackingCategory = {
  name: "Electronics",
  icon: "Smartphone",
  items: [
    { id: "elec-1", name: "Phone + charger", quantity: 1, checked: false, isCustom: false },
    { id: "elec-2", name: "Universal power adapter", quantity: 1, checked: false, isCustom: false },
    { id: "elec-3", name: "Portable power bank", quantity: 1, checked: false, isCustom: false },
    { id: "elec-4", name: "Camera + memory card", quantity: 1, checked: false, isCustom: false },
    { id: "elec-5", name: "Earbuds / headphones", quantity: 1, checked: false, isCustom: false },
  ],
};

const BASE_HEALTH: PackingCategory = {
  name: "Health & Safety",
  icon: "Heart",
  items: [
    { id: "health-1", name: "First aid kit (basics)", quantity: 1, checked: false, isCustom: false },
    { id: "health-2", name: "Prescription medications", quantity: 1, checked: false, isCustom: false },
    { id: "health-3", name: "Pain relievers", quantity: 1, checked: false, isCustom: false },
    { id: "health-4", name: "Anti-diarrhea tablets", quantity: 1, checked: false, isCustom: false },
    { id: "health-5", name: "Hand sanitizer", quantity: 1, checked: false, isCustom: false },
  ],
};

function getClothingByClimate(
  climate: string,
  duration: number
): PackingCategory {
  const tops = Math.ceil(duration / 2);
  const bottoms = Math.ceil(duration / 3);

  const baseItems = [
    { id: "cloth-1", name: "Underwear", quantity: duration, checked: false, isCustom: false },
    { id: "cloth-2", name: "Socks", quantity: duration, checked: false, isCustom: false },
    { id: "cloth-3", name: "Sleepwear", quantity: 2, checked: false, isCustom: false },
  ];

  if (climate === "tropical") {
    return {
      name: "Clothing",
      icon: "Shirt",
      items: [
        ...baseItems,
        { id: "cloth-4", name: "Lightweight t-shirts", quantity: tops, checked: false, isCustom: false },
        { id: "cloth-5", name: "Quick-dry shorts", quantity: bottoms, checked: false, isCustom: false },
        { id: "cloth-6", name: "Swimsuit", quantity: 2, checked: false, isCustom: false },
        { id: "cloth-7", name: "Light rain jacket", quantity: 1, checked: false, isCustom: false },
        { id: "cloth-8", name: "Sandals / flip-flops", quantity: 1, checked: false, isCustom: false },
        { id: "cloth-9", name: "Sun hat / cap", quantity: 1, checked: false, isCustom: false },
        { id: "cloth-10", name: "Lightweight dress / casual outfit", quantity: 2, checked: false, isCustom: false },
      ],
    };
  }

  if (climate === "cold") {
    return {
      name: "Clothing",
      icon: "Shirt",
      items: [
        ...baseItems,
        { id: "cloth-4", name: "Thermal base layers (top + bottom)", quantity: 2, checked: false, isCustom: false },
        { id: "cloth-5", name: "Warm fleece / sweaters", quantity: tops, checked: false, isCustom: false },
        { id: "cloth-6", name: "Insulated pants", quantity: bottoms, checked: false, isCustom: false },
        { id: "cloth-7", name: "Waterproof outer jacket", quantity: 1, checked: false, isCustom: false },
        { id: "cloth-8", name: "Warm hat / beanie", quantity: 1, checked: false, isCustom: false },
        { id: "cloth-9", name: "Thermal gloves", quantity: 1, checked: false, isCustom: false },
        { id: "cloth-10", name: "Scarf / neck gaiter", quantity: 1, checked: false, isCustom: false },
        { id: "cloth-11", name: "Warm boots", quantity: 1, checked: false, isCustom: false },
      ],
    };
  }

  // temperate / desert / mixed
  return {
    name: "Clothing",
    icon: "Shirt",
    items: [
      ...baseItems,
      { id: "cloth-4", name: "T-shirts / tops", quantity: tops, checked: false, isCustom: false },
      { id: "cloth-5", name: "Pants / jeans", quantity: bottoms, checked: false, isCustom: false },
      { id: "cloth-6", name: "Light jacket / cardigan", quantity: 1, checked: false, isCustom: false },
      { id: "cloth-7", name: "Comfortable walking shoes", quantity: 1, checked: false, isCustom: false },
      { id: "cloth-8", name: "Casual outfit for dinners", quantity: 2, checked: false, isCustom: false },
      { id: "cloth-9", name: "Sunglasses", quantity: 1, checked: false, isCustom: false },
    ],
  };
}

function getToiletriesByClimate(climate: string): PackingCategory {
  const base = [
    { id: "toil-1", name: "Toothbrush + toothpaste", quantity: 1, checked: false, isCustom: false },
    { id: "toil-2", name: "Deodorant", quantity: 1, checked: false, isCustom: false },
    { id: "toil-3", name: "Shampoo + conditioner (travel size)", quantity: 1, checked: false, isCustom: false },
    { id: "toil-4", name: "Face wash", quantity: 1, checked: false, isCustom: false },
    { id: "toil-5", name: "Razor + shaving cream", quantity: 1, checked: false, isCustom: false },
  ];

  if (climate === "tropical") {
    return {
      name: "Toiletries",
      icon: "Droplets",
      items: [
        ...base,
        { id: "toil-6", name: "Reef-safe sunscreen (SPF 50+)", quantity: 2, checked: false, isCustom: false },
        { id: "toil-7", name: "Insect repellent (DEET)", quantity: 1, checked: false, isCustom: false },
        { id: "toil-8", name: "After-sun / aloe vera", quantity: 1, checked: false, isCustom: false },
      ],
    };
  }

  if (climate === "cold") {
    return {
      name: "Toiletries",
      icon: "Droplets",
      items: [
        ...base,
        { id: "toil-6", name: "Lip balm (SPF)", quantity: 2, checked: false, isCustom: false },
        { id: "toil-7", name: "Moisturizer (heavy duty)", quantity: 1, checked: false, isCustom: false },
        { id: "toil-8", name: "Sunscreen (for snow glare)", quantity: 1, checked: false, isCustom: false },
      ],
    };
  }

  return {
    name: "Toiletries",
    icon: "Droplets",
    items: [
      ...base,
      { id: "toil-6", name: "Sunscreen (SPF 30+)", quantity: 1, checked: false, isCustom: false },
      { id: "toil-7", name: "Moisturizer", quantity: 1, checked: false, isCustom: false },
    ],
  };
}

function getActivityItems(activities: string[]): PackingCategory {
  const items: PackingCategory["items"] = [];
  let id = 0;

  if (activities.includes("hiking")) {
    items.push(
      { id: `act-${id++}`, name: "Hiking boots (broken in!)", quantity: 1, checked: false, isCustom: false },
      { id: `act-${id++}`, name: "Daypack / backpack", quantity: 1, checked: false, isCustom: false },
      { id: `act-${id++}`, name: "Reusable water bottle", quantity: 1, checked: false, isCustom: false },
      { id: `act-${id++}`, name: "Trekking poles (optional)", quantity: 1, checked: false, isCustom: false }
    );
  }
  if (activities.includes("beach")) {
    items.push(
      { id: `act-${id++}`, name: "Beach towel (quick-dry)", quantity: 1, checked: false, isCustom: false },
      { id: `act-${id++}`, name: "Snorkel mask", quantity: 1, checked: false, isCustom: false },
      { id: `act-${id++}`, name: "Waterproof phone pouch", quantity: 1, checked: false, isCustom: false }
    );
  }
  if (activities.includes("city")) {
    items.push(
      { id: `act-${id++}`, name: "Comfortable walking shoes", quantity: 1, checked: false, isCustom: false },
      { id: `act-${id++}`, name: "Crossbody bag / anti-theft bag", quantity: 1, checked: false, isCustom: false },
      { id: `act-${id++}`, name: "Guidebook or offline maps", quantity: 1, checked: false, isCustom: false }
    );
  }
  if (activities.includes("snow")) {
    items.push(
      { id: `act-${id++}`, name: "Snow boots", quantity: 1, checked: false, isCustom: false },
      { id: `act-${id++}`, name: "Ski goggles", quantity: 1, checked: false, isCustom: false },
      { id: `act-${id++}`, name: "Hand / toe warmers", quantity: 4, checked: false, isCustom: false }
    );
  }

  if (items.length === 0) {
    items.push(
      { id: `act-${id++}`, name: "Daypack / backpack", quantity: 1, checked: false, isCustom: false },
      { id: `act-${id++}`, name: "Reusable water bottle", quantity: 1, checked: false, isCustom: false }
    );
  }

  return { name: "Activity Gear", icon: "Compass", items };
}

export async function generatePackingList(data: {
  destination: string;
  duration: number;
  activities: string[];
  climate: string;
}): Promise<PackingList> {
  await simulateDelay(1500 + Math.random() * 1000);

  const categories: PackingCategory[] = [
    getClothingByClimate(data.climate, data.duration),
    getToiletriesByClimate(data.climate),
    BASE_ELECTRONICS,
    BASE_DOCUMENTS,
    BASE_HEALTH,
    getActivityItems(data.activities),
  ];

  return {
    id: `packing-${Date.now()}`,
    destination: data.destination,
    categories,
    generatedAt: new Date(),
  };
}
