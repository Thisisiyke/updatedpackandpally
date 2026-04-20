"use client";

import { useState, useMemo } from "react";
import { trips } from "@/data/trips";
import { Trip } from "@/types";

export function useFilterTrips() {
  const [search, setSearch] = useState("");
  const [continent, setContinent] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [priceRange, setPriceRange] = useState(0); // index into priceRanges
  const [sortBy, setSortBy] = useState("recommended");

  const priceRanges = [
    { label: "All Prices", min: 0, max: Infinity },
    { label: "Under $2,000", min: 0, max: 2000 },
    { label: "$2,000 - $3,000", min: 2000, max: 3000 },
    { label: "$3,000 - $4,000", min: 3000, max: 4000 },
    { label: "$4,000+", min: 4000, max: Infinity },
  ];

  const filtered = useMemo(() => {
    let result = [...trips];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q) ||
          t.country.toLowerCase().includes(q) ||
          t.category.some((c) => c.toLowerCase().includes(q))
      );
    }

    // Continent
    if (continent !== "All") {
      result = result.filter((t) => t.continent === continent);
    }

    // Difficulty
    if (difficulty !== "All") {
      result = result.filter((t) => t.difficulty === difficulty);
    }

    // Price
    const range = priceRanges[priceRange];
    if (range) {
      result = result.filter(
        (t) => t.price >= range.min && t.price < range.max
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "duration":
        result.sort((a, b) => a.durationDays - b.durationDays);
        break;
    }

    return result;
  }, [search, continent, difficulty, priceRange, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setContinent("All");
    setDifficulty("All");
    setPriceRange(0);
    setSortBy("recommended");
  };

  const hasActiveFilters =
    search !== "" ||
    continent !== "All" ||
    difficulty !== "All" ||
    priceRange !== 0;

  return {
    search,
    setSearch,
    continent,
    setContinent,
    difficulty,
    setDifficulty,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    filtered,
    clearFilters,
    hasActiveFilters,
    priceRanges,
  };
}
