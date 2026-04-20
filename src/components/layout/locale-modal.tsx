"use client";

import { useState } from "react";
import { X, Check, Globe, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { language: "English", region: "United States", code: "en-US" },
  { language: "English", region: "United Kingdom", code: "en-GB" },
  { language: "English", region: "Australia", code: "en-AU" },
  { language: "English", region: "Canada", code: "en-CA" },
  { language: "English", region: "India", code: "en-IN" },
  { language: "English", region: "Ireland", code: "en-IE" },
  { language: "English", region: "New Zealand", code: "en-NZ" },
  { language: "English", region: "Singapore", code: "en-SG" },
  { language: "Español", region: "España", code: "es-ES" },
  { language: "Español", region: "México", code: "es-MX" },
  { language: "Español", region: "Argentina", code: "es-AR" },
  { language: "Español", region: "Colombia", code: "es-CO" },
  { language: "Français", region: "France", code: "fr-FR" },
  { language: "Français", region: "Canada", code: "fr-CA" },
  { language: "Deutsch", region: "Deutschland", code: "de-DE" },
  { language: "Deutsch", region: "Österreich", code: "de-AT" },
  { language: "Deutsch", region: "Schweiz", code: "de-CH" },
  { language: "Italiano", region: "Italia", code: "it-IT" },
  { language: "Português", region: "Brasil", code: "pt-BR" },
  { language: "Português", region: "Portugal", code: "pt-PT" },
  { language: "Nederlands", region: "Nederland", code: "nl-NL" },
  { language: "Dansk", region: "Danmark", code: "da-DK" },
  { language: "Svenska", region: "Sverige", code: "sv-SE" },
  { language: "Norsk", region: "Norge", code: "nb-NO" },
  { language: "日本語", region: "日本", code: "ja-JP" },
  { language: "한국어", region: "대한민국", code: "ko-KR" },
  { language: "中文", region: "中国", code: "zh-CN" },
  { language: "中文", region: "臺灣", code: "zh-TW" },
  { language: "العربية", region: "السعودية", code: "ar-SA" },
  { language: "हिन्दी", region: "भारत", code: "hi-IN" },
  { language: "Bahasa Indonesia", region: "Indonesia", code: "id-ID" },
  { language: "ไทย", region: "ประเทศไทย", code: "th-TH" },
  { language: "Tiếng Việt", region: "Việt Nam", code: "vi-VN" },
  { language: "Türkçe", region: "Türkiye", code: "tr-TR" },
  { language: "Polski", region: "Polska", code: "pl-PL" },
  { language: "Čeština", region: "Česká republika", code: "cs-CZ" },
];

const currencies = [
  { code: "USD", name: "United States Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "COP", name: "Colombian Peso", symbol: "COL$" },
  { code: "ARS", name: "Argentine Peso", symbol: "AR$" },
  { code: "CLP", name: "Chilean Peso", symbol: "CL$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/." },
];

export function LocaleModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"language" | "currency">("language");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [autoTranslate, setAutoTranslate] = useState(true);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl bg-white shadow-2xl animate-[pop-in_300ms_cubic-bezier(0.16,1,0.3,1)] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Tabs */}
          <div className="border-b px-14 pt-14 pb-0">
            <div className="flex gap-6">
              <button
                onClick={() => setTab("language")}
                className={cn(
                  "pb-3 text-sm font-semibold transition-colors border-b-2",
                  tab === "language"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Language and region
              </button>
              <button
                onClick={() => setTab("currency")}
                className={cn(
                  "pb-3 text-sm font-semibold transition-colors border-b-2",
                  tab === "currency"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Currency
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-14 py-6">
            {tab === "language" && (
              <>
                {/* Translation toggle */}
                <div className="flex items-center justify-between rounded-xl border p-4 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">Translation</span>
                    <Languages className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <button
                    onClick={() => setAutoTranslate(!autoTranslate)}
                    className={cn(
                      "relative h-8 w-14 rounded-full transition-colors",
                      autoTranslate ? "bg-foreground" : "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                        autoTranslate ? "left-7" : "left-1"
                      )}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground -mt-6 mb-6">
                  Automatically translate descriptions and reviews to English.
                </p>

                <h3 className="text-lg font-semibold mb-4">
                  Choose a language and region
                </h3>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-left transition-all hover:bg-muted/50",
                        selectedLanguage === lang.code
                          ? "border-foreground bg-muted/30"
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <p className="text-sm font-medium">{lang.language}</p>
                      <p className="text-xs text-muted-foreground">
                        {lang.region}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === "currency" && (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  Choose a currency
                </h3>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {currencies.map((cur) => (
                    <button
                      key={cur.code}
                      onClick={() => setSelectedCurrency(cur.code)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-left transition-all hover:bg-muted/50",
                        selectedCurrency === cur.code
                          ? "border-foreground bg-muted/30"
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <p className="text-sm font-medium">
                        {cur.symbol} — {cur.code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cur.name}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
