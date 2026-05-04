import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  compact,
}: {
  value: number;
  compact?: boolean;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            compact ? "h-3 w-3" : "h-3.5 w-3.5",
            n <= Math.floor(rounded)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}
