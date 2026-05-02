"use client";

import { useState, useMemo } from "react";
import {
  ListChecks,
  Loader2,
  Plus,
  Printer,
  Download,
  ChevronDown,
  ChevronRight,
  Trash2,
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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PackingList } from "@/types";
import { generatePackingList } from "@/lib/ai/mock-packing-list";
import { useRequireMember } from "@/hooks/use-require-member";

const climates = [
  { value: "tropical", label: "Tropical" },
  { value: "temperate", label: "Temperate" },
  { value: "cold", label: "Cold" },
  { value: "desert", label: "Desert" },
];

const activityOptions = ["Hiking", "Beach", "City", "Snow"];

export function PackingListGenerator() {
  const { ensureMember, loginDialog, authLoading } = useRequireMember();
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("7");
  const [climate, setClimate] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "generating" | "complete">("idle");
  const [list, setList] = useState<PackingList | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemName, setNewItemName] = useState("");

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity.toLowerCase())
        ? prev.filter((a) => a !== activity.toLowerCase())
        : [...prev, activity.toLowerCase()]
    );
  };

  const runGenerate = async () => {
    if (!destination || !climate) return;
    setStatus("generating");

    const result = await generatePackingList({
      destination,
      duration: Number(duration),
      activities: selectedActivities,
      climate,
    });

    setList(result);
    setExpandedCategories(new Set(result.categories.map((c) => c.name)));
    setStatus("complete");
  };

  const handleGenerate = () => {
    ensureMember(() => void runGenerate());
  };

  const toggleItem = (categoryName: string, itemId: string) => {
    if (!list) return;
    setList({
      ...list,
      categories: list.categories.map((cat) =>
        cat.name === categoryName
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId
                  ? { ...item, checked: !item.checked }
                  : item
              ),
            }
          : cat
      ),
    });
  };

  const addCustomItem = () => {
    if (!list || !newItemCategory || !newItemName.trim()) return;
    setList({
      ...list,
      categories: list.categories.map((cat) =>
        cat.name === newItemCategory
          ? {
              ...cat,
              items: [
                ...cat.items,
                {
                  id: `custom-${Date.now()}`,
                  name: newItemName.trim(),
                  quantity: 1,
                  checked: false,
                  isCustom: true,
                },
              ],
            }
          : cat
      ),
    });
    setNewItemName("");
  };

  const removeCustomItem = (categoryName: string, itemId: string) => {
    if (!list) return;
    setList({
      ...list,
      categories: list.categories.map((cat) =>
        cat.name === categoryName
          ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) }
          : cat
      ),
    });
  };

  const progress = useMemo(() => {
    if (!list) return 0;
    const all = list.categories.flatMap((c) => c.items);
    if (all.length === 0) return 0;
    return Math.round((all.filter((i) => i.checked).length / all.length) * 100);
  }, [list]);

  const totalItems = list
    ? list.categories.reduce((s, c) => s + c.items.length, 0)
    : 0;
  const checkedItems = list
    ? list.categories.reduce(
        (s, c) => s + c.items.filter((i) => i.checked).length,
        0
      )
    : 0;

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const exportCSV = () => {
    if (!list) return;
    const rows = ["Category,Item,Quantity,Packed"];
    list.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        rows.push(
          `"${cat.name}","${item.name}",${item.quantity},${item.checked ? "Yes" : "No"}`
        );
      });
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `packing-list-${list.destination.toLowerCase().replace(/\s/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStatus("idle");
    setList(null);
    setDestination("");
    setDuration("7");
    setClimate("");
    setSelectedActivities([]);
  };

  // Generating
  if (status === "generating") {
    return (
      <>
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ListChecks className="h-12 w-12 text-primary animate-pulse" />
            <h3 className="mt-6 text-xl font-bold">
              Building Your Packing List
            </h3>
            <p className="mt-2 text-muted-foreground">
              Analyzing destination and activities...
            </p>
            <Progress value={50} className="mt-6 w-64 h-2" />
          </CardContent>
        </Card>
        {loginDialog}
      </>
    );
  }

  // Result
  if (status === "complete" && list) {
    return (
      <>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Packing List for {list.destination}
            </h2>
            <p className="text-sm text-muted-foreground">
              {checkedItems} of {totalItems} items packed
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>

        <Progress value={progress} className="h-3" />

        {/* Categories */}
        {list.categories.map((cat) => {
          const catChecked = cat.items.filter((i) => i.checked).length;
          const isExpanded = expandedCategories.has(cat.name);

          return (
            <Card key={cat.name}>
              <button
                onClick={() => toggleCategory(cat.name)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-semibold">{cat.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {catChecked}/{cat.items.length}
                  </Badge>
                </div>
              </button>
              {isExpanded && (
                <CardContent className="pt-0 pb-4">
                  <div className="space-y-2">
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() =>
                              toggleItem(cat.name, item.id)
                            }
                          />
                          <span
                            className={`text-sm ${
                              item.checked
                                ? "text-muted-foreground line-through"
                                : ""
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.quantity > 1 && (
                            <Badge variant="outline" className="text-xs">
                              x{item.quantity}
                            </Badge>
                          )}
                          {item.isCustom && (
                            <button
                              onClick={() =>
                                removeCustomItem(cat.name, item.id)
                              }
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* Add Custom Item */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Custom Item
            </h3>
            <div className="flex gap-2">
              <Select value={newItemCategory} onValueChange={(v) => v && setNewItemCategory(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {list.categories.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addCustomItem} disabled={!newItemCategory || !newItemName.trim()}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={reset}>
          Generate New List
        </Button>
      </div>
      {loginDialog}
      </>
    );
  }

  // Form
  return (
    <>
    <Card className="mx-auto max-w-2xl">
      <CardContent className="pt-6 space-y-6">
        <div className="text-center mb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
            <ListChecks className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">AI Packing List Generator</h2>
          <p className="mt-1 text-muted-foreground">
            Never forget an essential again
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Destination</Label>
            <Input
              placeholder="e.g., Bali, Iceland, Peru..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trip duration</Label>
              <Select value={duration} onValueChange={(v) => v && setDuration(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10, 14, 21].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Climate</Label>
              <Select value={climate} onValueChange={(v) => v && setClimate(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select climate" />
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

          <div className="space-y-2">
            <Label>Activities planned</Label>
            <div className="flex flex-wrap gap-2">
              {activityOptions.map((activity) => (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedActivities.includes(activity.toLowerCase())
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          className="w-full h-11 gap-2"
          disabled={!destination || !climate || authLoading}
          onClick={handleGenerate}
        >
          <ListChecks className="h-4 w-4" />
          Generate Packing List
        </Button>
      </CardContent>
    </Card>
    {loginDialog}
    </>
  );
}
