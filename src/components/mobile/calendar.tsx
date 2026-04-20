"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selected?: string | null;
  onSelect: (date: string) => void;
  minDate?: string;
  highlightColor?: string;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function startOfDay(d: Date) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function Calendar({
  selected,
  onSelect,
  minDate,
  highlightColor = "bg-red-500 text-white",
}: CalendarProps) {
  const today = startOfDay(new Date());
  const selectedDate = selected ? startOfDay(new Date(selected)) : null;
  const minDateObj = minDate ? startOfDay(new Date(minDate)) : null;

  const [view, setView] = useState(() => selectedDate || today);

  const year = view.getFullYear();
  const month = view.getMonth();

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0

    const out: { date: Date; isCurrent: boolean }[] = [];

    // Trailing days from previous month
    for (let i = firstWeekday - 1; i >= 0; i--) {
      out.push({
        date: new Date(year, month, -i),
        isCurrent: false,
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      out.push({
        date: new Date(year, month, i),
        isCurrent: true,
      });
    }

    // Leading days from next month
    while (out.length < 42) {
      const last = out[out.length - 1].date;
      const n = new Date(last);
      n.setDate(n.getDate() + 1);
      out.push({ date: n, isCurrent: false });
    }

    return out;
  }, [year, month]);

  const prevMonth = () => setView(new Date(year, month - 1, 1));
  const nextMonth = () => setView(new Date(year, month + 1, 1));

  return (
    <div className="bg-white">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-sm font-bold">
          {MONTHS[month]} {year}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-muted-foreground py-1.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map(({ date, isCurrent }, idx) => {
          const iso = toISO(date);
          const isSelected =
            selectedDate && startOfDay(date).getTime() === selectedDate.getTime();
          const isToday = startOfDay(date).getTime() === today.getTime();
          const disabled = minDateObj
            ? startOfDay(date).getTime() < minDateObj.getTime()
            : false;

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(iso)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors mx-auto",
                isSelected && highlightColor,
                !isSelected && isToday && "text-red-500 font-bold",
                !isSelected && !isToday && isCurrent && !disabled && "hover:bg-muted",
                !isCurrent && "text-muted-foreground/40",
                disabled && "text-muted-foreground/30 cursor-not-allowed"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
