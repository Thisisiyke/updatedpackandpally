"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatInstallmentDue } from "@/lib/installment-schedule";
import { CalendarClock } from "lucide-react";

export type InstallmentPlanRow = {
  index: number;
  amount: number;
  dueAt: string;
};

type InstallmentPlan = {
  installments: InstallmentPlanRow[];
};

function isoToDateInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

interface Props {
  bookingId: string;
  tripStartDate: string;
  paymentStatus?: string;
  amountToPay?: number | string;
  plan: InstallmentPlan | null | undefined;
  onSaved?: (next: {
    installmentPlan: InstallmentPlan;
    scheduleDateToPay: string;
  }) => void;
  className?: string;
}

export function TravelerInstallmentDateEditor({
  bookingId,
  tripStartDate,
  paymentStatus,
  amountToPay,
  plan,
  onSaved,
  className,
}: Props) {
  const [rows, setRows] = useState<InstallmentPlanRow[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const editable = useMemo(() => {
    if (paymentStatus !== "partial") return false;
    const n = Number(amountToPay);
    if (!Number.isFinite(n) || n <= 0) return false;
    if (!plan?.installments?.length || plan.installments.length < 2) return false;
    return true;
  }, [paymentStatus, amountToPay, plan]);

  const displayRows = rows ?? plan?.installments ?? [];

  if (!editable) return null;

  const startBound = tripStartDate.slice(0, 10);

  const updateDue = (index: number, ymd: string) => {
    setRows((prev) => {
      const base = prev ?? plan!.installments;
      return base.map((r) =>
        r.index === index ? { ...r, dueAt: new Date(ymd + "T12:00:00.000Z").toISOString() } : r
      );
    });
    setSaved(false);
  };

  const save = async () => {
    const working = rows ?? plan!.installments;
    const updates = working
      .filter((r) => r.index >= 2)
      .map((r) => ({
        index: r.index,
        dueAt: isoToDateInput(r.dueAt),
      }));
    if (updates.length === 0) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/bookings/update-installment-dates", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, updates }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        installmentPlan?: InstallmentPlan;
        scheduleDateToPay?: string;
        message?: string;
      };
      if (!res.ok || data.status !== "success" || !data.installmentPlan) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Could not save dates"
        );
      }
      setRows(data.installmentPlan.installments);
      setSaved(true);
      onSaved?.({
        installmentPlan: data.installmentPlan,
        scheduleDateToPay: String(data.scheduleDateToPay ?? ""),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={
        className ??
        "rounded-2xl border bg-white p-6 space-y-4 border-primary/15 bg-primary/[0.03]"
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
          <CalendarClock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Your payment schedule</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            You can change <strong>due dates</strong> for upcoming installments (amounts
            stay the same). The first payment is already complete.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {displayRows.map((row) => {
          const isPaid = row.index === 1;
          return (
            <div
              key={row.index}
              className="flex flex-col sm:flex-row sm:items-end gap-3 rounded-xl border bg-muted/20 p-3"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-[10px] text-muted-foreground">
                    Installment {row.index}
                  </Label>
                  <p className="text-sm font-semibold mt-0.5">
                    {isPaid ? "Paid at checkout" : "Due"}
                  </p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Amount</Label>
                  <p className="text-sm font-bold mt-0.5">
                    ${Number(row.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Due date</Label>
                  {isPaid ? (
                    <p className="text-sm font-medium mt-0.5">
                      {formatInstallmentDue(row.dueAt)}
                    </p>
                  ) : (
                    <Input
                      type="date"
                      className="mt-1 h-9"
                      min={new Date().toISOString().slice(0, 10)}
                      max={
                        startBound
                          ? (() => {
                              const t = new Date(startBound + "T12:00:00.000Z");
                              t.setUTCDate(t.getUTCDate() - 1);
                              return t.toISOString().slice(0, 10);
                            })()
                          : undefined
                      }
                      value={isoToDateInput(row.dueAt)}
                      onChange={(e) => updateDue(row.index, e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-destructive border border-destructive/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Schedule updated.
        </p>
      )}

      <Button type="button" onClick={() => void save()} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Saving…" : "Save new due dates"}
      </Button>
    </div>
  );
}
