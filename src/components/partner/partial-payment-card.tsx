"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  computeInstallments,
  daysUntilStart,
  formatInstallmentDue,
  hoursUntilStart,
  installmentsEligible,
  INSTALLMENTS_MIN_HOURS,
  validateCustomSplits,
  type CustomSplit,
  type PaymentSchedule,
} from "@/lib/installment-schedule";

type Props = {
  enabled: boolean;
  onEnabledChange: (next: boolean) => void;
  schedule: PaymentSchedule;
  onScheduleChange: (next: PaymentSchedule) => void;
  customSplits: CustomSplit[];
  onCustomSplitsChange: (next: CustomSplit[]) => void;
  /** Per-person total, used for the live preview only. */
  totalPerPerson: number;
  /** ISO yyyy-mm-dd start date. */
  startDate: string;
  /** Tighter spacing for the mobile partner pages. */
  compact?: boolean;
};

const DEFAULT_CUSTOM_SPLITS: CustomSplit[] = [
  { dueAt: "", percent: 0.5 },
  { dueAt: "", percent: 0.5 },
];

export function PartialPaymentCard({
  enabled,
  onEnabledChange,
  schedule,
  onScheduleChange,
  customSplits,
  onCustomSplitsChange,
  totalPerPerson,
  startDate,
  compact,
}: Props) {
  const splits =
    customSplits && customSplits.length >= 2
      ? customSplits
      : DEFAULT_CUSTOM_SPLITS;

  const customError =
    schedule === "custom" ? validateCustomSplits(splits) : null;

  const updateRow = (idx: number, patch: Partial<CustomSplit>) => {
    const next = splits.map((row, i) =>
      i === idx ? { ...row, ...patch } : row
    );
    onCustomSplitsChange(next);
  };

  const addRow = () => {
    onCustomSplitsChange([...splits, { dueAt: "", percent: 0 }]);
  };

  const removeRow = (idx: number) => {
    if (splits.length <= 2) return;
    onCustomSplitsChange(splits.filter((_, i) => i !== idx));
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-white space-y-3",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Label className="text-sm font-bold">Allow partial payment</Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Travelers split the price across multiple installments before the
            trip starts. Disabled automatically inside {INSTALLMENTS_MIN_HOURS}{" "}
            hours of trip start.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onEnabledChange(!enabled)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
            enabled ? "bg-primary" : "bg-muted-foreground/25"
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
              enabled ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Split style
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "biweekly", label: "Bi-weekly", hint: "Every 2 weeks" },
                  { id: "weekly", label: "Weekly", hint: "Every week" },
                  { id: "custom", label: "Custom", hint: "Pick dates" },
                ] as const
              ).map((opt) => {
                const active = schedule === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onScheduleChange(opt.id)}
                    className={cn(
                      "rounded-lg border text-left p-2 transition-colors",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/40"
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        active ? "text-primary" : "text-foreground"
                      )}
                    >
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {opt.hint}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {schedule === "custom" && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Custom installments
              </p>
              <div className="space-y-2">
                {splits.map((row, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border bg-muted/10 p-2 grid grid-cols-[1fr_72px_28px] gap-2 items-center"
                  >
                    <div>
                      <Label className="text-[10px] text-muted-foreground">
                        Due date
                      </Label>
                      <Input
                        type="date"
                        value={row.dueAt ? row.dueAt.slice(0, 10) : ""}
                        onChange={(e) =>
                          updateRow(idx, { dueAt: e.target.value })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">
                        %
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={Math.round((row.percent || 0) * 100)}
                        onChange={(e) =>
                          updateRow(idx, {
                            percent:
                              Math.max(0, Math.min(100, Number(e.target.value) || 0)) /
                              100,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={splits.length <= 2}
                      className="self-end mb-0.5 inline-flex h-8 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive disabled:opacity-30"
                      aria-label="Remove installment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Add installment
              </button>
              {customError && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                  {customError}
                </p>
              )}
            </div>
          )}

          <InstallmentPreview
            totalPerPerson={totalPerPerson}
            startDate={startDate}
            schedule={schedule}
            customSplits={schedule === "custom" ? splits : undefined}
          />
        </div>
      )}
    </div>
  );
}

function InstallmentPreview({
  totalPerPerson,
  startDate,
  schedule,
  customSplits,
}: {
  totalPerPerson: number;
  startDate: string;
  schedule: PaymentSchedule;
  customSplits?: CustomSplit[];
}) {
  if (!startDate) {
    return (
      <p className="text-[11px] text-muted-foreground italic">
        Pick a trip start date to preview the installment schedule.
      </p>
    );
  }
  if (!installmentsEligible(startDate)) {
    const hours = hoursUntilStart(startDate);
    const days = daysUntilStart(startDate);
    const window =
      hours <= 0
        ? "already started"
        : hours < 48
        ? `only ${hours} hour${hours === 1 ? "" : "s"} away`
        : `${days} day${days === 1 ? "" : "s"} away`;
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
        Installments aren&apos;t allowed within {INSTALLMENTS_MIN_HOURS} hours
        of trip start. This trip is {window} — travelers will be asked to pay
        in full at checkout.
      </div>
    );
  }

  if (
    schedule === "custom" &&
    (validateCustomSplits(customSplits || []) !== null)
  ) {
    return (
      <p className="text-[11px] text-muted-foreground italic">
        Add valid custom installments to preview the schedule.
      </p>
    );
  }

  const items = computeInstallments(
    totalPerPerson,
    startDate,
    schedule,
    customSplits
  );
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Per-person schedule ({items.length} installments)
      </p>
      {items.map((s) => (
        <div
          key={s.index}
          className="rounded-lg border bg-muted/20 p-3 flex items-center gap-3"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary shrink-0">
            {s.index}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{s.label}</p>
            <p className="text-[10px] text-muted-foreground">
              Due {formatInstallmentDue(s.dueAt)} ·{" "}
              {Math.round(s.percent * 100)}%
            </p>
          </div>
          <p className="font-bold text-sm shrink-0">
            ${s.amount.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
