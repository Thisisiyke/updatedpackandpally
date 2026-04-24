"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileHeader({
  title,
  showBack = true,
  onBack,
  action,
  transparent = false,
  className,
}: {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between gap-2 px-4 py-3 md:pt-14",
        transparent ? "bg-transparent" : "bg-white/95 backdrop-blur-md border-b",
        className
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showBack && (
          <button
            onClick={() => (onBack ? onBack() : router.back())}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors shrink-0",
              transparent ? "bg-white/90 backdrop-blur-md" : "bg-muted/50 hover:bg-muted"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {title && (
          <h1 className={cn(
            "font-bold truncate text-base",
            !showBack && "ml-1"
          )}>
            {title}
          </h1>
        )}
      </div>

      {/* Right */}
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
