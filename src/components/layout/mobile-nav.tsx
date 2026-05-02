"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getMainNavLinks } from "@/lib/main-nav-links";
import { LogoutDialog } from "@/components/shared/logout-dialog";
import type { PackPallyUser } from "@/types/packpally-user";
import { usePackPallyAuth } from "@/components/providers/session-provider";

export function MobileNav({
  open,
  onClose,
  user,
  onOpenLocale,
}: {
  open: boolean;
  onClose: () => void;
  user: PackPallyUser | null;
  onOpenLocale: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = usePackPallyAuth();
  const isLoggedIn = !!user;
  const mainNavLinks = getMainNavLinks(pathname, user);
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[300px] sm:w-[350px]">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Pack & Pally"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
              <span className="font-heading">Pack & Pally</span>
            </SheetTitle>
          </SheetHeader>

          {user && (
            <div className="mt-6 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-primary/10">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}

          <nav className="mt-6 flex flex-col gap-1">
            {mainNavLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                onClick={onClose}
                className="rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLocale();
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
              Language & Currency
            </button>
          </nav>

          <div className="mt-8 flex flex-col gap-3 px-3">
            {isLoggedIn ? (
              <Button
                variant="outline"
                className="w-full gap-1.5"
                onClick={() => {
                  onClose();
                  setLogoutOpen(true);
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login" onClick={onClose}>
                    Login
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/signup" onClick={onClose}>
                    Sign Up Free
                  </Link>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={async () => {
          await logout();
          router.push("/");
          router.refresh();
        }}
      />
    </>
  );
}
