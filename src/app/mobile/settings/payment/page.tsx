"use client";

import { useState } from "react";
import { Plus, CreditCard, MoreHorizontal, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Card = {
  id: string;
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  exp: string;
  nickname?: string;
  isDefault?: boolean;
};

const initialCards: Card[] = [
  {
    id: "1",
    brand: "visa",
    last4: "4829",
    exp: "08/27",
    nickname: "Personal",
    isDefault: true,
  },
  {
    id: "2",
    brand: "mastercard",
    last4: "1192",
    exp: "03/26",
    nickname: "Work",
  },
];

function brandStyle(brand: Card["brand"]) {
  switch (brand) {
    case "visa":
      return "bg-gradient-to-br from-[#1a1f71] to-[#0f2b63]";
    case "mastercard":
      return "bg-gradient-to-br from-[#eb001b] to-[#ff5f00]";
    case "amex":
      return "bg-gradient-to-br from-[#006fcf] to-[#2557a7]";
  }
}

function brandLabel(brand: Card["brand"]) {
  return { visa: "VISA", mastercard: "MasterCard", amex: "AMEX" }[brand];
}

export default function MobilePaymentSettingsPage() {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [addOpen, setAddOpen] = useState(false);

  // Add-card form state
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const formatNumber = (v: string) =>
    v.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (v: string) => {
    const c = v.replace(/\D/g, "");
    return c.length >= 2 ? `${c.slice(0, 2)}/${c.slice(2, 4)}` : c;
  };

  const addCard = () => {
    const clean = number.replace(/\s/g, "");
    if (clean.length < 12) return;
    const last4 = clean.slice(-4);
    setCards((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        brand: "visa",
        last4,
        exp: expiry,
        nickname: name || "My card",
      },
    ]);
    setNumber("");
    setName("");
    setExpiry("");
    setCvc("");
    setAddOpen(false);
  };

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const makeDefault = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({ ...c, isDefault: c.id === id }))
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Payment methods" />

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Cards */}
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "relative rounded-2xl p-5 text-white shadow-lg overflow-hidden",
              brandStyle(card.brand)
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            <div className="relative flex items-center justify-between mb-8">
              <CreditCard className="h-6 w-6 text-white/70" />
              <span className="text-sm font-bold tracking-wider">
                {brandLabel(card.brand)}
              </span>
            </div>
            <p className="relative text-base tracking-[0.2em] font-mono mb-4">
              •••• •••• •••• {card.last4}
            </p>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[9px] opacity-60 uppercase">Holder</p>
                <p className="text-xs font-medium">
                  {card.nickname?.toUpperCase() || "CARD"}
                </p>
              </div>
              <div>
                <p className="text-[9px] opacity-60 uppercase">Expires</p>
                <p className="text-xs font-medium">{card.exp}</p>
              </div>
              {card.isDefault && (
                <Badge className="bg-white/20 text-white border-white/30 text-[10px]">
                  Default
                </Badge>
              )}
            </div>

            <div className="absolute bottom-3 right-3">
              <details className="relative">
                <summary className="list-none cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </summary>
                <div className="absolute right-0 bottom-10 w-44 rounded-xl bg-white border shadow-lg text-foreground overflow-hidden z-10">
                  {!card.isDefault && (
                    <button
                      onClick={() => makeDefault(card.id)}
                      className="w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-muted/50"
                    >
                      Set as default
                    </button>
                  )}
                  <button className="w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-muted/50">
                    Edit nickname
                  </button>
                  <button
                    onClick={() => removeCard(card.id)}
                    className="w-full text-left px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove card
                  </button>
                </div>
              </details>
            </div>
          </div>
        ))}

        {/* Add new */}
        <button
          onClick={() => setAddOpen(true)}
          className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/60 hover:bg-primary/5 transition-all py-6 flex flex-col items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-semibold">Add new card</span>
        </button>

        {/* Security notice */}
        <div className="rounded-xl bg-muted/50 p-3 flex items-start gap-2 mt-4">
          <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your payment info is encrypted and stored securely. We never store your CVC.
          </p>
        </div>
      </div>

      {/* Add card sheet */}
      <BottomSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add card"
        footer={
          <Button
            className="w-full h-11"
            onClick={addCard}
            disabled={!number || !name || !expiry || !cvc}
          >
            Add card
          </Button>
        }
      >
        <div className="space-y-4 pb-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Card number</Label>
            <Input
              value={number}
              onChange={(e) => setNumber(formatNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className="h-11 font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cardholder name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="As shown on card"
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Expiry</Label>
              <Input
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CVC</Label>
              <Input
                value={cvc}
                onChange={(e) =>
                  setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="123"
                maxLength={4}
                className="h-11"
              />
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
