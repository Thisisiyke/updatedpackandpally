"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, LayoutDashboard, ChevronDown, User, Settings, Globe, HelpCircle, Heart, Gift, Users, MapPin, Building2, Sparkles, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navLinks } from "@/lib/constants";
import { MobileNav } from "./mobile-nav";
import { LocaleModal } from "./locale-modal";
import { LogoutDialog } from "@/components/shared/logout-dialog";

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY < 10) {
        setVisible(true);
        setScrolled(false);
        lastScrollY.current = currentY;
        return;
      }

      setScrolled(currentY > 50);

      if (currentY < lastScrollY.current) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 5) {
        setVisible(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLoggedIn = status === "authenticated" && session?.user;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          scrolled ? "shadow-sm" : "shadow-none"
        } ${
          visible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Pack & Pally"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="text-xl font-bold tracking-tight font-heading">
              Pack & Pally
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Locale button */}
            <button
              onClick={() => setLocaleOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-accent"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
            </button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="flex items-center gap-2 rounded-full border pl-1 pr-2.5 py-1 transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  }
                >
                  <div className="relative h-7 w-7 overflow-hidden rounded-full bg-primary/10">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-0 rounded-xl">
                  {/* Help Center */}
                  <DropdownMenuItem
                    onClick={() => router.push("#")}
                    className="px-4 py-3 rounded-none"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Help Center
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-0" />

                  {/* Partner portal - featured item */}
                  {(session.user as any).role === "host" ? (
                    <DropdownMenuItem
                      onClick={() => router.push("/partner")}
                      className="px-4 py-4 rounded-none"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold">Partner Portal</p>
                            <Sparkles className="h-3 w-3 text-primary" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Manage your listings,<br />bookings, and payouts.
                          </p>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 ml-3 items-center justify-center rounded-xl bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => router.push("/become-a-host")}
                      className="px-4 py-4 rounded-none"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p className="text-sm font-semibold">Become a host</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            It&apos;s easy to start hosting and<br />earn extra income.
                          </p>
                        </div>
                        <div className="relative h-10 w-10 shrink-0 ml-3">
                          <Image
                            src="/logo.png"
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 object-contain"
                          />
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-0" />

                  {/* Admin portal (for admin users only) */}
                  {(session.user as any).role === "admin" && (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push("/admin")}
                        className="px-4 py-3 rounded-none text-red-600 focus:text-red-600"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-0" />
                    </>
                  )}

                  {/* Navigation links */}
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-3 rounded-none"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-3 rounded-none"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/browse-trips")}
                    className="px-4 py-3 rounded-none"
                  >
                    <MapPin className="h-4 w-4" />
                    Find a trip
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-3 rounded-none"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-0" />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={() => setLogoutOpen(true)}
                    className="px-4 py-3 rounded-none text-muted-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up Free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        session={session}
        onOpenLocale={() => setLocaleOpen(true)}
      />

      <LocaleModal open={localeOpen} onClose={() => setLocaleOpen(false)} />

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => signOut({ callbackUrl: "/" })}
      />
    </>
  );
}
