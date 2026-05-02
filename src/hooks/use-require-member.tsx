"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";
import { isPackPallyMember } from "@/lib/member-auth";

export function useRequireMember() {
  const { user, loading } = usePackPallyAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [returnTo, setReturnTo] = useState(pathname);

  useEffect(() => {
    if (typeof window === "undefined") {
      setReturnTo(pathname);
      return;
    }
    const q = window.location.search ?? "";
    setReturnTo(q.length > 0 ? `${pathname}${q}` : pathname);
  }, [pathname]);

  const ensureMember = useCallback(
    (action: () => void) => {
      if (loading) return;
      if (isPackPallyMember(user)) {
        action();
        return;
      }
      if (typeof window !== "undefined") {
        const q = window.location.search ?? "";
        setReturnTo(q.length > 0 ? `${pathname}${q}` : pathname);
      } else {
        setReturnTo(pathname);
      }
      setOpen(true);
    },
    [user, loading, pathname]
  );

  const loginDialog = (
    <LoginRequiredDialog open={open} onOpenChange={setOpen} returnTo={returnTo} />
  );

  return {
    ensureMember,
    authLoading: loading,
    loginDialog,
    isMember: isPackPallyMember(user),
  };
}
