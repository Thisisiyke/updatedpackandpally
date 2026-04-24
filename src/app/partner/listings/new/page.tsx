"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Upload, Building2, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const steps = [
  { num: 1, title: "Property type", icon: Building2 },
  { num: 2, title: "Location", icon: MapPin },
  { num: 3, title: "Pricing", icon: DollarSign },
  { num: 4, title: "Review", icon: Check },
];

export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [type, setType] = useState("hotel");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [price, setPrice] = useState(150);
  const [rooms, setRooms] = useState(10);

  const canNext = () => {
    if (step === 1) return name.length > 0;
    if (step === 2) return address && city && country;
    if (step === 3) return price > 0 && rooms > 0;
    return true;
  };

  const handleCreate = () => {
    router.push("/partner/listings");
  };

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 gap-1.5 -ml-3 text-muted-foreground"
        >
          <Link href="/partner/listings">
            <ChevronLeft className="h-4 w-4" />
            Back to listings
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Add a new listing
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tell us about your property in a few steps
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        {/* Steps sidebar */}
        <aside>
          <div className="space-y-1">
            {steps.map((s) => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div
                  key={s.num}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                    isActive && "bg-primary/10 text-primary font-medium",
                    !isActive && !isDone && "text-muted-foreground",
                    isDone && "text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full shrink-0 text-xs font-semibold",
                      isActive && "bg-primary text-white",
                      isDone && "bg-emerald-500 text-white",
                      !isActive && !isDone && "bg-muted"
                    )}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : s.num}
                  </div>
                  {s.title}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Form */}
        <div className="rounded-2xl border bg-white p-6 lg:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">What kind of property?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Start with the basics
                </p>
              </div>

              <div className="space-y-2">
                <Label>Property name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., The Seaside Villa"
                />
              </div>

              <div className="space-y-2">
                <Label>Property type</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { value: "hotel", label: "Hotel" },
                    { value: "apartment", label: "Apartment" },
                    { value: "villa", label: "Villa" },
                    { value: "resort", label: "Resort" },
                    { value: "hostel", label: "Hostel" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={cn(
                        "rounded-xl border p-4 text-sm font-medium transition-all",
                        type === t.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "hover:bg-muted/30"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Short description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes your property special?"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Cover photo</Label>
                <button className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors py-10 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                  <Upload className="h-6 w-6" />
                  <p className="text-sm font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs">JPG or PNG, up to 10MB</p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Where is it located?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Guests will use this for directions
                </p>
              </div>

              <div className="space-y-2">
                <Label>Street address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Seaside Drive"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Positano"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Italy"
                  />
                </div>
              </div>

              {/* Map placeholder */}
              <div className="relative h-48 rounded-xl bg-muted overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "url('https://tile.openstreetmap.org/5/16/12.png')",
                    backgroundSize: "cover",
                    opacity: 0.35,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <MapPin className="h-8 w-8" />
                    <p className="text-sm">
                      Map preview available after publish
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Set your pricing</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  You can change this anytime
                </p>
              </div>

              <div className="space-y-2">
                <Label>Base price per night</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="pl-8 h-14 text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Similar listings charge $180-$320/night in your area
                </p>
              </div>

              <div className="space-y-2">
                <Label>Number of rooms</Label>
                <Input
                  type="number"
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                />
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                <p className="text-sm font-medium mb-3">Your potential earnings</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Per week</p>
                    <p className="text-lg font-bold">
                      ${(price * rooms * 7 * 0.7).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Per month</p>
                    <p className="text-lg font-bold">
                      ${(price * rooms * 30 * 0.7).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Per year</p>
                    <p className="text-lg font-bold">
                      ${(price * rooms * 365 * 0.7).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Based on 70% occupancy · commission included
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Review & publish</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Take one last look before going live
                </p>
              </div>

              <div className="rounded-xl border p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Name & Type
                  </p>
                  <p className="font-medium">{name || "—"}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {type}
                  </p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{address || "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {city}, {country}
                  </p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Pricing</p>
                  <p className="font-medium">
                    ${price}/night · {rooms} room{rooms > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
                Your listing will be saved as a <strong>draft</strong> first.
                You can publish it when you&apos;re ready.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleCreate}>Create listing</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
