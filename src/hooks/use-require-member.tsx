"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";
import { isPackPallyMember } from "@/lib/member-auth";

export function useRequireMember() {
  const { user, loading } = usePackPallyAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const returnTo = useMemo(() => {
    const q = searchParams.toString();
    return q ? `${pathname}?${q}` : pathname;
  }, [pathname, searchParams]);

  const ensureMember = useCallback(
    (action: () => void) => {
      if (loading) return;
      if (isPackPallyMember(user)) {
        action();
        return;
      }
      setOpen(true);
    },
    [user, loading]
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
