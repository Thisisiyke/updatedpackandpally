import { cn } from "@/lib/utils";

export function PriceTag({
  amount,
  className,
  label = "From",
}: {
  amount: number;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-1", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-xl font-bold">
        ${amount.toLocaleString()}
      </span>
    </div>
  );
}
