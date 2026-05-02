"use client";

import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRequireMember } from "@/hooks/use-require-member";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Button> & {
  href: string;
};

export function HostApplyButton({
  href,
  children,
  className,
  ...rest
}: Props) {
  const router = useRouter();
  const { ensureMember, loginDialog } = useRequireMember();

  return (
    <>
      <Button
        type="button"
        {...rest}
        className={cn(className)}
        onClick={(e) => {
          e.preventDefault();
          ensureMember(() => router.push(href));
        }}
      >
        {children}
      </Button>
      {loginDialog}
    </>
  );
}
