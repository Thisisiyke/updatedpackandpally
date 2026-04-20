"use client";

import { useState } from "react";
import { Check, Search, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en-US", language: "English", region: "United States" },
  { code: "en-GB", language: "English", region: "United Kingdom" },
  { code: "en-AU", language: "English", region: "Australia" },
  { code: "en-CA", language: "English", region: "Canada" },
  { code: "en-IN", language: "English", region: "India" },
  { code: "es-ES", language: "Español", region: "España" },
  { code: "es-MX", language: "Español", region: "México" },
  { code: "es-AR", language: "Español", region: "Argentina" },
  { code: "fr-FR", language: "Français", region: "France" },
  { code: "fr-CA", language: "Français", region: "Canada" },
  { code: "de-DE", language: "Deutsch", region: "Deutschland" },
  { code: "it-IT", language: "Italiano", region: "Italia" },
  { code: "pt-BR", language: "Português", region: "Brasil" },
  { code: "pt-PT", language: "Português", region: "Portugal" },
  { code: "nl-NL", language: "Nederlands", region: "Nederland" },
  { code: "sv-SE", language: "Svenska", region: "Sverige" },
  { code: "ja-JP", language: "日本語", region: "日本" },
  { code: "ko-KR", language: "한국어", region: "대한민국" },
  { code: "zh-CN", language: "中文", region: "中国" },
  { code: "ar-SA", language: "العربية", region: "السعودية" },
];

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
];

export default function MobileLanguageSettingsPage() {
  const [tab, setTab] = useState<"language" | "currency">("language");
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [selectedCur, setSelectedCur] = useState("USD");
  const [search, setSearch] = useState("");

  const list =
    tab === "language"
      ? languages.filter(
          (l) =>
            !search ||
            l.language.toLowerCase().includes(search.toLowerCase()) ||
            l.region.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  const currencyList = currencies.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Language & region" />

      {/* Tabs */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setTab("language")}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
              tab === "language"
                ? "bg-white shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Language
          </button>
          <button
            onClick={() => setTab("currency")}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
              tab === "currency"
                ? "bg-white shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Currency
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tab === "language" ? "Search language..." : "Search currency..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {tab === "language" ? (
          <div className="divide-y bg-white">
            {list.map((l) => {
              const active = selectedLang === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => setSelectedLang(l.code)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-semibold">{l.language}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {l.region}
                    </p>
                  </div>
                  {active ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-border" />
                  )}
                </button>
              );
            })}
            {list.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No matches
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y bg-white">
            {currencyList.map((c) => {
              const active = selectedCur === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setSelectedCur(c.code)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                      {c.symbol}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{c.code}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {c.name}
                      </p>
                    </div>
                  </div>
                  {active ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-border" />
                  )}
                </button>
              );
            })}
            {currencyList.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No matches
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
