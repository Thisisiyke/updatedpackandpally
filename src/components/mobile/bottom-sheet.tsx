"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  // Prevent body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] animate-[fade-in_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Sheet — slides up from bottom */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[60] flex flex-col max-h-[90vh] rounded-t-3xl bg-white shadow-2xl",
          "animate-[sheet-up_300ms_cubic-bezier(0.16,1,0.3,1)]",
          className
        )}
      >
        {/* Grabber */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-base font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Sticky footer */}
        {footer && (
          <div className="border-t p-4 pb-6 md:pb-8">{footer}</div>
        )}
      </div>
    </>
  );
}
