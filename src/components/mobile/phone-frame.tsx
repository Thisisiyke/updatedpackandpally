"use client";

import { useEffect, useState } from "react";

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="md:flex md:items-start md:justify-center md:min-h-screen md:py-8 md:px-4">
      {/* Phone frame (desktop only) */}
      <div className="md:relative md:w-[390px] md:h-[844px] md:bg-black md:rounded-[60px] md:p-3 md:shadow-2xl md:ring-8 md:ring-black/5">
        <div className="relative w-full h-full md:rounded-[48px] md:overflow-hidden bg-white">
          {/* Status bar (desktop only) */}
          <div className="hidden md:flex absolute top-0 left-0 right-0 z-50 h-12 items-center justify-between px-8 bg-transparent pointer-events-none">
            <span className="text-[14px] font-semibold text-black">{time}</span>
            {/* Notch */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 w-[110px] rounded-[20px] bg-black" />
            <div className="flex items-center gap-1 text-black">
              {/* Signal */}
              <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
                <rect x="0" y="7" width="3" height="4" rx="0.5" />
                <rect x="4" y="5" width="3" height="6" rx="0.5" />
                <rect x="8" y="3" width="3" height="8" rx="0.5" />
                <rect x="12" y="0" width="3" height="11" rx="0.5" />
              </svg>
              {/* WiFi */}
              <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
                <path d="M8 9.5 L9.5 8 L8 6.5 L6.5 8 Z" />
                <path d="M8 6 C9.5 6 10.7 6.5 11.7 7.5 L13 6.2 C11.6 4.8 9.9 4 8 4 C6.1 4 4.4 4.8 3 6.2 L4.3 7.5 C5.3 6.5 6.5 6 8 6 Z" opacity="0.8" />
                <path d="M8 2 C10.5 2 12.8 3 14.5 4.7 L15.8 3.4 C13.8 1.3 11 0 8 0 C5 0 2.2 1.3 0.2 3.4 L1.5 4.7 C3.2 3 5.5 2 8 2 Z" opacity="0.6" />
              </svg>
              {/* Battery */}
              <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
                <rect x="0" y="0" width="22" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                <rect x="2" y="2" width="15" height="8" rx="1.5" />
                <rect x="22" y="4" width="2" height="4" rx="0.5" opacity="0.5" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="h-full w-full md:pt-0 overflow-y-auto overflow-x-hidden">
            {children}
          </div>

          {/* Home indicator (desktop only) */}
          <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-32 rounded-full bg-black/80 z-50" />
        </div>
      </div>
    </div>
  );
}
