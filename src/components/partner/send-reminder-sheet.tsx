"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, MessageSquare, Bell, Check, Send, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  REMINDER_TEMPLATES,
  saveReminder,
  type ReminderChannel,
} from "@/data/reminders";
import type { PartnerBooking } from "@/lib/partner-bookings";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
  hostName: string;
  partialBookings: PartnerBooking[];
  /** Optional pre-selected booking (row-level remind button). */
  prefocusBookingId?: string | null;
  onSent?: (count: number, channel: ReminderChannel) => void;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDueDate(iso?: string) {
  if (!iso) return "your trip start";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderTemplate(
  text: string,
  b: PartnerBooking,
  tripTitle: string,
  hostName: string
) {
  return text
    .replace(/\{name\}/g, b.contact.firstName)
    .replace(/\{tripTitle\}/g, tripTitle)
    .replace(/\{amountDue\}/g, formatMoney(b.amountDueLater))
    .replace(/\{dueDate\}/g, formatDueDate(b.paymentDueAt))
    .replace(/\{hostName\}/g, hostName);
}

export function SendReminderSheet({
  open,
  onClose,
  tripId,
  tripTitle,
  hostName,
  partialBookings,
  prefocusBookingId,
  onSent,
}: Props) {
  const [channel, setChannel] = useState<ReminderChannel>("email");
  const [templateId, setTemplateId] = useState(REMINDER_TEMPLATES[0].id);
  const [subject, setSubject] = useState(REMINDER_TEMPLATES[0].subject);
  const [body, setBody] = useState(REMINDER_TEMPLATES[0].body);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewIndex, setPreviewIndex] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Reset / prefill when opening
  useEffect(() => {
    if (!open) return;
    const initialTemplate = REMINDER_TEMPLATES[0];
    setChannel("email");
    setTemplateId(initialTemplate.id);
    setSubject(initialTemplate.subject);
    setBody(initialTemplate.body);
    setPreviewIndex(0);
    setSending(false);
    setSent(false);
    const seed = prefocusBookingId
      ? new Set([prefocusBookingId])
      : new Set(partialBookings.map((b) => b.bookingId));
    setSelectedIds(seed);
  }, [open, prefocusBookingId, partialBookings]);

  const selectedBookings = useMemo(
    () => partialBookings.filter((b) => selectedIds.has(b.bookingId)),
    [partialBookings, selectedIds]
  );

  const activePreviewBooking =
    selectedBookings[Math.min(previewIndex, selectedBookings.length - 1)];

  const handleTemplate = (id: string) => {
    const t = REMINDER_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setTemplateId(id);
    if (t.id !== "custom") {
      setSubject(t.subject);
      setBody(t.body);
    } else {
      setSubject("");
      setBody("");
    }
  };

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === partialBookings.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(partialBookings.map((b) => b.bookingId)));
  };

  const canSend = selectedBookings.length > 0 && body.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 700)); // simulate delivery
    saveReminder({
      tripId,
      channel,
      subject: channel === "email" ? subject : undefined,
      body,
      recipientBookingIds: selectedBookings.map((b) => b.bookingId),
      recipientNames: selectedBookings.map(
        (b) => `${b.contact.firstName} ${b.contact.lastName}`
      ),
      senderName: hostName,
    });
    setSending(false);
    setSent(true);
    onSent?.(selectedBookings.length, channel);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="!max-w-2xl sm:!max-w-2xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle>Send payment reminder</DialogTitle>
          <DialogDescription>
            Nudge travelers with an outstanding balance on {tripTitle}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Channel */}
          <div className="space-y-2">
            <Label className="text-xs">Send via</Label>
            <div className="grid grid-cols-3 gap-2">
              <ChannelTile
                active={channel === "email"}
                onClick={() => setChannel("email")}
                icon={<Mail className="h-4 w-4 text-primary" />}
                label="Email"
                description="To email on file"
              />
              <ChannelTile
                active={channel === "sms"}
                onClick={() => setChannel("sms")}
                icon={<MessageSquare className="h-4 w-4 text-primary" />}
                label="SMS text"
                description="To phone on file"
              />
              <ChannelTile
                active={channel === "push"}
                onClick={() => setChannel("push")}
                icon={<Bell className="h-4 w-4 text-primary" />}
                label="App push"
                description="In Pack & Pally"
              />
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Recipients ({selectedIds.size}/{partialBookings.length})
              </Label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-primary font-medium hover:underline"
              >
                {selectedIds.size === partialBookings.length
                  ? "Clear all"
                  : "Select all partial"}
              </button>
            </div>
            <div className="rounded-xl border divide-y max-h-44 overflow-y-auto">
              {partialBookings.map((b) => {
                const checked = selectedIds.has(b.bookingId);
                return (
                  <label
                    key={b.bookingId}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm cursor-pointer transition-colors",
                      checked ? "bg-primary/5" : "hover:bg-muted/40"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(b.bookingId)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {b.contact.firstName} {b.contact.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {channel === "email"
                          ? b.contact.email
                          : channel === "sms"
                          ? b.contact.phone
                          : "Pack & Pally app"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-amber-700">
                        Owes {formatMoney(b.amountDueLater)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Due {formatDueDate(b.paymentDueAt)}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Template */}
          <div className="space-y-2">
            <Label className="text-xs">Template</Label>
            <div className="flex flex-wrap gap-1.5">
              {REMINDER_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplate(t.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    templateId === t.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject (email only) */}
          {channel === "email" && (
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="rem-subject">
                Subject
              </Label>
              <Input
                id="rem-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your balance for {tripTitle}"
              />
            </div>
          )}

          {/* Body */}
          <div className="space-y-2">
            <Label className="text-xs" htmlFor="rem-body">
              Message
            </Label>
            <textarea
              id="rem-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={channel === "push" ? 4 : 7}
              maxLength={
                channel === "push" ? 180 : channel === "sms" ? 480 : 1500
              }
              placeholder={
                channel === "push"
                  ? "Short tap-worthy message… {name}, your balance is due."
                  : channel === "sms"
                  ? "Hi {name}, quick note…"
                  : "Write your message…"
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <p className="text-[11px] text-muted-foreground">
              Merge tokens:{" "}
              <code>{"{name}"}</code> · <code>{"{tripTitle}"}</code> ·{" "}
              <code>{"{amountDue}"}</code> · <code>{"{dueDate}"}</code> ·{" "}
              <code>{"{hostName}"}</code>
              {channel === "sms" && <> · limit {body.length}/480</>}
              {channel === "push" && <> · limit {body.length}/180</>}
            </p>
          </div>

          {/* Preview */}
          {activePreviewBooking && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">
                  Preview for {activePreviewBooking.contact.firstName}{" "}
                  {activePreviewBooking.contact.lastName}
                </p>
                {selectedBookings.length > 1 && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewIndex((i) =>
                          (i - 1 + selectedBookings.length) %
                          selectedBookings.length
                        )
                      }
                      className="rounded border px-1.5 py-0.5 hover:bg-white"
                    >
                      ‹
                    </button>
                    <span className="text-muted-foreground">
                      {previewIndex + 1}/{selectedBookings.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewIndex(
                          (i) => (i + 1) % selectedBookings.length
                        )
                      }
                      className="rounded border px-1.5 py-0.5 hover:bg-white"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
              {channel === "email" && (
                <div className="text-xs">
                  <div className="text-muted-foreground">
                    <span className="font-semibold">To:</span>{" "}
                    {activePreviewBooking.contact.email}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-semibold">Subject:</span>{" "}
                    {renderTemplate(
                      subject,
                      activePreviewBooking,
                      tripTitle,
                      hostName
                    )}
                  </div>
                </div>
              )}
              {channel === "sms" && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold">To:</span>{" "}
                  {activePreviewBooking.contact.phone}
                </div>
              )}
              {channel === "push" && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold">To:</span> Pack &amp; Pally
                  app · {activePreviewBooking.contact.firstName}
                </div>
              )}
              <pre className="whitespace-pre-wrap text-sm font-sans text-foreground/90 leading-relaxed bg-white border rounded-lg p-3">
                {renderTemplate(body, activePreviewBooking, tripTitle, hostName)}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4 gap-2">
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!canSend || sending}
            className="min-w-[180px] gap-1.5"
          >
            {sent ? (
              <>
                <Check className="h-4 w-4" />
                Sent
              </>
            ) : sending ? (
              "Sending…"
            ) : (
              <>
                <Send className="h-4 w-4" />
                {channel === "email"
                  ? "Send email"
                  : channel === "sms"
                  ? "Send SMS"
                  : "Send push"}{" "}
                to {selectedIds.size}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChannelTile({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "hover:border-primary/40"
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-semibold text-sm">{label}</span>
        {active && <Check className="h-3.5 w-3.5 text-primary ml-auto" />}
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
        {description}
      </p>
    </button>
  );
}
