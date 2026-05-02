"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { PackPallyUser } from "@/types/packpally-user";
import type { TravelerDashboardBooking } from "@/lib/wanderly-traveler-bookings";

export type TravelerProfileRecord = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  role?: string;
  isVerified?: string;
  accountCreatedDate?: string;
};

type Props = {
  packUser: PackPallyUser;
  refreshAuth: () => Promise<void>;
  myBookings: TravelerDashboardBooking[];
};

export function TravelerProfilePanel({
  packUser,
  refreshAuth,
  myBookings,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<TravelerProfileRecord | null>(null);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let r = await fetch("/api/me/profile", { credentials: "include" });
      if (r.status === 401) {
        await fetch("/api/auth/me", { method: "POST", credentials: "include" });
        r = await fetch("/api/me/profile", { credentials: "include" });
      }
      const d = (await r.json()) as {
        profile?: TravelerProfileRecord;
        error?: string;
      };
      if (!r.ok) {
        setProfile(null);
        setError(d.error || "Could not load profile.");
        return;
      }
      const p = d.profile;
      if (!p) {
        setError("No profile data.");
        return;
      }
      setProfile(p);
      setFirstName(p.firstName || "");
      setLastName(p.lastName || "");
      setEmail(p.email || packUser.email || "");
      setPhone(p.phone || "");
      setBio(p.bio || "");
    } catch {
      setError("Could not load profile.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [packUser.email]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayName =
    profile?.fullName ||
    `${firstName} ${lastName}`.trim() ||
    packUser.name ||
    "Traveler";
  const avatarSrc =
    profile?.profileImage || packUser.image || "";
  const initial = displayName.charAt(0).toUpperCase();

  const tripsCompleted = myBookings.filter((b) => b.status === "completed").length;
  const activeDestinations = new Set(
    myBookings
      .filter((b) => b.status !== "cancelled")
      .map((b) => b.destination)
      .filter(Boolean)
  ).size;

  const memberSince =
    profile?.accountCreatedDate?.slice(0, 4) ||
    "—";

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    setOkMsg("");
    try {
      const r = await fetch("/api/me/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          bio,
        }),
      });
      const d = (await r.json()) as { profile?: TravelerProfileRecord; error?: string };
      if (!r.ok) {
        setError(d.error || "Save failed.");
        return;
      }
      if (d.profile) setProfile(d.profile);
      setOkMsg("Profile saved.");
      await refreshAuth();
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }
    setUploading(true);
    setError("");
    setOkMsg("");
    try {
      const fd = new FormData();
      fd.append("images", file);
      const pre = profile?.profileImage || packUser.image;
      if (pre && pre.startsWith("http")) {
        fd.append("preUrl", pre);
      }
      const r = await fetch("/api/me/profile/avatar", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const d = (await r.json()) as { profile?: TravelerProfileRecord; error?: string };
      if (!r.ok) {
        setError(d.error || "Upload failed.");
        return;
      }
      if (d.profile) setProfile((prev) => ({ ...prev, ...d.profile }));
      setOkMsg("Profile photo updated.");
      await refreshAuth();
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const savePassword = async () => {
    setPwMsg("");
    setError("");
    if (pwNew !== pwConfirm) {
      setPwMsg("New password and confirmation do not match.");
      return;
    }
    setPwSaving(true);
    try {
      const r = await fetch("/api/me/password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPassword: pwCurrent,
          newPassword: pwNew,
        }),
      });
      const d = (await r.json()) as { error?: string };
      if (!r.ok) {
        setPwMsg(d.error || "Could not change password.");
        return;
      }
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
      setPwMsg("Password updated.");
    } catch {
      setPwMsg("Could not change password.");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-10 flex justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!profile && error) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => void load()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 space-y-6">
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
      {okMsg ? (
        <p className="text-sm text-emerald-700">{okMsg}</p>
      ) : null}

      <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">
        <div className="relative h-24 w-24 shrink-0">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-primary/10 bg-primary/10">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={displayName}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
                {initial}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:opacity-90 disabled:opacity-50"
            aria-label="Change profile photo"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onPickAvatar}
          />
        </div>
        <div className="flex-1 w-full space-y-1">
          <h2 className="text-xl font-bold">{displayName}</h2>
          <p className="text-muted-foreground text-sm">{email}</p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <Badge variant="secondary">
              {profile?.role === "host" || packUser.role === "host"
                ? "Host"
                : "Traveler"}
            </Badge>
            {profile?.isVerified ? (
              <Badge variant="secondary">Verified: {profile.isVerified}</Badge>
            ) : null}
            <Badge variant="outline">Member since {memberSince}</Badge>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Trips completed", value: String(tripsCompleted) },
          { label: "Destinations", value: String(activeDestinations) },
          { label: "All bookings", value: String(myBookings.length) },
          { label: "Reviews", value: "—" },
        ].map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-4 max-w-xl">
        <h3 className="font-semibold">Edit details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pf-first">First name</Label>
            <Input
              id="pf-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-last">Last name</Label>
            <Input
              id="pf-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-email">Email</Label>
          <Input
            id="pf-email"
            type="email"
            value={email}
            disabled
            className="bg-muted/50 text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Email is tied to your account and can&apos;t be changed here.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-phone">Phone</Label>
          <Input
            id="pf-phone"
            inputMode="numeric"
            placeholder="Digits only (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-bio">Bio</Label>
          <Textarea
            id="pf-bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell other travelers a bit about you…"
          />
          <p className="text-xs text-muted-foreground">{bio.length}/300</p>
        </div>
        <Button onClick={() => void saveProfile()} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>

      <Separator />

      <div className="space-y-4 max-w-xl">
        <div>
          <h3 className="font-semibold">Password</h3>
          <p className="text-xs text-muted-foreground mt-1">
            For accounts that use email and password. OAuth-only accounts may not
            have a password here.
          </p>
        </div>
        {pwMsg ? (
          <p
            className={
              pwMsg.includes("updated")
                ? "text-sm text-emerald-700"
                : "text-sm text-red-600"
            }
          >
            {pwMsg}
          </p>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="pw-cur">Current password</Label>
          <Input
            id="pw-cur"
            type="password"
            autoComplete="current-password"
            value={pwCurrent}
            onChange={(e) => setPwCurrent(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw-new">New password</Label>
          <Input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            value={pwNew}
            onChange={(e) => setPwNew(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw-confirm">Confirm new password</Label>
          <Input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            value={pwConfirm}
            onChange={(e) => setPwConfirm(e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => void savePassword()}
          disabled={pwSaving}
        >
          {pwSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Updating…
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </div>
    </div>
  );
}
