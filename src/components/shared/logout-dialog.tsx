"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-[pop-in_300ms_cubic-bezier(0.16,1,0.3,1)] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4">
            <LogOut className="h-6 w-6 text-red-600" />
          </div>

          {/* Content */}
          <h2 className="text-center text-xl font-bold">Log out?</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            You&apos;ll need to sign in again to access your bookings,
            wishlist, and trips.
          </p>

          {/* Actions */}
          <div className="mt-6 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-11"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                onClose();
                onConfirm();
              }}
            >
              Log out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
