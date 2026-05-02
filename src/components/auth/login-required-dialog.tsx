"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnTo: string;
  title?: string;
  description?: string;
};

export function LoginRequiredDialog({
  open,
  onOpenChange,
  returnTo,
  title = "Sign in to continue",
  description = "Create an account or sign in to complete bookings, host setup, and AI tools.",
}: Props) {
  const nextHref = `/login?next=${encodeURIComponent(returnTo)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Button asChild>
            <Link href={nextHref}>Sign in</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
