"use client";

import { useCallback, useEffect, useState } from "react";

export type WishlistType = "trip" | "flight" | "hotel";

export interface WishlistItem {
  id: string;
  type: WishlistType;
  title: string;
  subtitle?: string;
  image?: string;
  price?: number;
  addedAt: string;
}

const STORAGE_KEY = "packpally_wishlist";

// Custom event so multiple hook instances stay in sync
const WISHLIST_EVENT = "packpally_wishlist_change";

function readStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: WishlistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT));
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);

    const sync = () => setItems(readStorage());
    window.addEventListener(WISHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isSaved = useCallback(
    (id: string, type: WishlistType) =>
      items.some((i) => i.id === id && i.type === type),
    [items]
  );

  const toggle = useCallback(
    (item: Omit<WishlistItem, "addedAt">) => {
      const current = readStorage();
      const exists = current.some(
        (i) => i.id === item.id && i.type === item.type
      );
      const next = exists
        ? current.filter((i) => !(i.id === item.id && i.type === item.type))
        : [...current, { ...item, addedAt: new Date().toISOString() }];
      writeStorage(next);
      setItems(next);
      return !exists; // returns new saved state
    },
    []
  );

  const remove = useCallback((id: string, type: WishlistType) => {
    const current = readStorage();
    const next = current.filter((i) => !(i.id === id && i.type === type));
    writeStorage(next);
    setItems(next);
  }, []);

  const clear = useCallback(() => {
    writeStorage([]);
    setItems([]);
  }, []);

  return {
    items,
    hydrated,
    isSaved,
    toggle,
    remove,
    clear,
    count: items.length,
  };
}
