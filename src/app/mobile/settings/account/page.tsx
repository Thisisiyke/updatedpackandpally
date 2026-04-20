"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MobileHeader } from "@/components/mobile/mobile-header";

export default function MobileAccountSettingsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      {saved && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg animate-[fade-in-up_300ms_ease-out]">
          <Check className="h-4 w-4" />
          Profile updated
        </div>
      )}

      <MobileHeader title="Account settings" />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center py-3">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl font-bold text-primary">E</span>
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <button className="mt-3 text-xs font-semibold text-primary">
            Change photo
          </button>
        </div>

        {/* Personal info */}
        <div className="rounded-2xl bg-white border divide-y">
          <div className="p-4 space-y-2">
            <Label className="text-[11px] text-muted-foreground">Full name</Label>
            <Input defaultValue="Explorer" className="h-11" />
          </div>
          <div className="p-4 space-y-2">
            <Label className="text-[11px] text-muted-foreground">
              Display name
            </Label>
            <Input defaultValue="Explorer" className="h-11" />
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Contact
          </h3>
          <div className="rounded-2xl bg-white border divide-y">
            <div className="p-4 space-y-2">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </Label>
              <Input
                type="email"
                defaultValue="explorer@packandpally.com"
                className="h-11"
              />
              <p className="text-[10px] text-emerald-600 font-medium">
                ✓ Verified
              </p>
            </div>
            <div className="p-4 space-y-2">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Phone
              </Label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="h-11"
              />
            </div>
          </div>
        </div>

        {/* Personal details */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Personal
          </h3>
          <div className="rounded-2xl bg-white border divide-y">
            <div className="p-4 space-y-2">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date of birth
              </Label>
              <Input type="date" className="h-11" />
            </div>
            <div className="p-4 space-y-2">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Country / region
              </Label>
              <Input defaultValue="United States" className="h-11" />
            </div>
            <div className="p-4 space-y-2">
              <Label className="text-[11px] text-muted-foreground">About me</Label>
              <Textarea
                placeholder="Tell fellow travelers about yourself..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Danger zone */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-red-600/80 mb-2 px-1">
            Danger zone
          </h3>
          <div className="rounded-2xl bg-white border border-red-100 divide-y">
            <button className="w-full flex items-center justify-between p-4 hover:bg-red-50/30 transition-colors">
              <span className="text-sm font-medium text-red-600">
                Deactivate account
              </span>
              <span className="text-[10px] text-muted-foreground">
                Temporarily hide
              </span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-red-50/30 transition-colors">
              <span className="text-sm font-medium text-red-600">
                Delete account
              </span>
              <span className="text-[10px] text-muted-foreground">Permanent</span>
            </button>
          </div>
        </div>

        <div className="h-4" />
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8">
        <Button className="w-full h-12 text-base" onClick={handleSave}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
