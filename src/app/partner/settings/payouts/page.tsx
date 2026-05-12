import Link from "next/link";
import { Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PayoutsSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Wallet className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Payouts &amp; billing</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Stripe Connect status, payout schedule, currency, and tax info live
          here. The full editor is being wired into the live Stripe flow.
        </p>
        <Button asChild className="mt-6 gap-1.5">
          <Link href="/partner/payouts">
            View payout history
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
