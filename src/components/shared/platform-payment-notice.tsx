import { cn } from "@/lib/utils";

export function PlatformPaymentNotice({
  variant = "host-inline",
  className,
}: {
  variant?: "host-inline" | "compact";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground",
        variant === "compact" && "text-xs py-2",
        className
      )}
    >
      <p className="font-medium text-foreground">How payouts work</p>
      <p className="mt-1 leading-relaxed">
        Travelers pay through the platform. Pack &amp; Pally settles with hosts via Stripe
        Connect according to your payout schedule. Stripe stores verification and tax details.
      </p>
    </div>
  );
}
