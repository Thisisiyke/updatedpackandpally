"use client";

import { useMemo, useState } from "react";
import {
  ListChecks,
  Plus,
  Printer,
  Download,
  ChevronDown,
  ChevronRight,
  X,
  ArrowLeft,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { generatePackingList } from "@/lib/ai/mock-packing-list";
import { PackingList } from "@/types";
import { cn } from "@/lib/utils";

const climates = [
  { value: "tropical", label: "Tropical" },
  { value: "temperate", label: "Temperate" },
  { value: "cold", label: "Cold" },
  { value: "desert", label: "Desert" },
];

const activityOptions = ["Hiking", "Beach", "City", "Snow"];

export default function MobilePackingListPage() {
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("7");
  const [climate, setClimate] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [status, setStatus] = useState<"form" | "loading" | "result">("form");
  const [list, setList] = useState<PackingList | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState("");

  const toggleActivity = (a: string) =>
    setSelectedActivities((prev) =>
      prev.includes(a.toLowerCase())
        ? prev.filter((x) => x !== a.toLowerCase())
        : [...prev, a.toLowerCase()]
    );

  const generate = async () => {
    if (!destination || !climate) return;
    setStatus("loading");
    const result = await generatePackingList({
      destination,
      duration: Number(duration),
      activities: selectedActivities,
      climate,
    });
    setList(result);
    setExpanded(new Set(result.categories.map((c) => c.name)));
    setStatus("result");
  };

  const toggleItem = (catName: string, itemId: string) => {
    if (!list) return;
    setList({
      ...list,
      categories: list.categories.map((c) =>
        c.name === catName
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, checked: !i.checked } : i
              ),
            }
          : c
      ),
    });
  };

  const addCustom = () => {
    if (!list || !newCategory || !newItem.trim()) return;
    setList({
      ...list,
      categories: list.categories.map((c) =>
        c.name === newCategory
          ? {
              ...c,
              items: [
                ...c.items,
                {
                  id: `custom-${Date.now()}`,
                  name: newItem.trim(),
                  quantity: 1,
                  checked: false,
                  isCustom: true,
                },
              ],
            }
          : c
      ),
    });
    setNewItem("");
    setAddOpen(false);
  };

  const removeCustom = (catName: string, itemId: string) => {
    if (!list) return;
    setList({
      ...list,
      categories: list.categories.map((c) =>
        c.name === catName
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      ),
    });
  };

  const toggleCategory = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const progress = useMemo(() => {
    if (!list) return { percent: 0, checked: 0, total: 0 };
    const all = list.categories.flatMap((c) => c.items);
    const checked = all.filter((i) => i.checked).length;
    return {
      percent: all.length ? Math.round((checked / all.length) * 100) : 0,
      checked,
      total: all.length,
    };
  }, [list]);

  const reset = () => {
    setStatus("form");
    setList(null);
    setDestination("");
    setClimate("");
    setSelectedActivities([]);
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
        <MobileHeader title="Building list..." showBack={false} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <ListChecks className="h-12 w-12 text-primary animate-pulse" />
          <h2 className="mt-5 text-xl font-bold">Building your list</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-[260px]">
            Picking smart essentials based on your trip...
          </p>
        </div>
      </div>
    );
  }

  if (status === "result" && list) {
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
        <MobileHeader
          title={list.destination}
          onBack={reset}
          action={
            <div className="flex gap-1.5">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50">
                <Printer className="h-4 w-4" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50">
                <Download className="h-4 w-4" />
              </button>
            </div>
          }
        />

        {/* Progress */}
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold">
              {progress.checked} of {progress.total} packed
            </span>
            <span className="text-xs font-bold">{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} className="h-2" />
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {list.categories.map((cat) => {
            const open = expanded.has(cat.name);
            const catChecked = cat.items.filter((i) => i.checked).length;
            return (
              <div
                key={cat.name}
                className="rounded-2xl bg-white border overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(cat.name)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {open ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-bold text-sm">{cat.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {catChecked}/{cat.items.length}
                    </Badge>
                  </div>
                </button>
                {open && (
                  <div className="border-t divide-y">
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() =>
                              toggleItem(cat.name, item.id)
                            }
                          />
                          <span
                            className={cn(
                              "text-sm truncate",
                              item.checked &&
                                "line-through text-muted-foreground"
                            )}
                          >
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.quantity > 1 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 font-normal"
                            >
                              x{item.quantity}
                            </Badge>
                          )}
                          {item.isCustom && (
                            <button
                              onClick={() => removeCustom(cat.name, item.id)}
                              className="text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add custom */}
        <div className="sticky bottom-0 bg-white border-t p-3 md:pb-8">
          <Button
            variant="outline"
            className="w-full h-11 gap-2"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add custom item
          </Button>
        </div>

        <BottomSheet
          open={addOpen}
          onClose={() => setAddOpen(false)}
          title="Add custom item"
          footer={
            <Button
              className="w-full h-11"
              onClick={addCustom}
              disabled={!newCategory || !newItem.trim()}
            >
              Add item
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select
                value={newCategory}
                onValueChange={(v) => v && setNewCategory(v)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {list.categories.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Item name</Label>
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g., Sun hat"
                className="h-11"
              />
            </div>
          </div>
        </BottomSheet>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Packing list" />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm mb-3">
            <ListChecks className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold leading-tight">
            Never forget an essential
          </h2>
          <p className="text-xs text-white/80 mt-1">
            Tell us about your trip and we&apos;ll build a smart packing list for you.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Destination</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Bali, Iceland, Peru..."
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Trip duration</Label>
              <Select value={duration} onValueChange={(v) => v && setDuration(v)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10, 14, 21].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Climate</Label>
              <Select value={climate} onValueChange={(v) => v && setClimate(v)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pick one" />
                </SelectTrigger>
                <SelectContent>
                  {climates.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Activities planned</Label>
            <div className="flex flex-wrap gap-2">
              {activityOptions.map((a) => {
                const active = selectedActivities.includes(a.toLowerCase());
                return (
                  <button
                    key={a}
                    onClick={() => toggleActivity(a)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8">
        <Button
          className="w-full h-12 gap-2"
          size="lg"
          disabled={!destination || !climate}
          onClick={generate}
        >
          <ListChecks className="h-4 w-4" />
          Generate my list
        </Button>
      </div>
    </div>
  );
}
