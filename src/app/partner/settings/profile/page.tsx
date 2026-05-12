"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Save,
  Check,
  Camera,
  X,
  Plus,
  User as UserIcon,
  Globe,
  AtSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getHostProfile,
  saveHostProfile,
  type HostProfile,
} from "@/lib/host-profile";
import { CURRENT_PARTNER } from "@/data/conversations";

export default function ProfileSettingsPage() {
  const [initial, setInitial] = useState<HostProfile>({});

  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLang, setNewLang] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = getHostProfile();
    setInitial(p);
    setDisplayName(p.displayName || CURRENT_PARTNER.name);
    setHeadline(p.headline || "");
    setBio(p.bio || "");
    setCountry(p.country || "");
    setLanguages(p.languages || []);
    setAvatar(p.avatar || CURRENT_PARTNER.avatar);
    setInstagram(p.instagram || "");
    setWebsite(p.website || "");
  }, []);

  const dirty = useMemo(() => {
    return (
      displayName !== (initial.displayName || CURRENT_PARTNER.name) ||
      headline !== (initial.headline || "") ||
      bio !== (initial.bio || "") ||
      country !== (initial.country || "") ||
      JSON.stringify(languages) !==
        JSON.stringify(initial.languages || []) ||
      avatar !== (initial.avatar || CURRENT_PARTNER.avatar) ||
      instagram !== (initial.instagram || "") ||
      website !== (initial.website || "")
    );
  }, [
    initial,
    displayName,
    headline,
    bio,
    country,
    languages,
    avatar,
    instagram,
    website,
  ]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 4 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result || ""));
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const addLanguage = () => {
    const v = newLang.trim();
    if (v && !languages.includes(v)) {
      setLanguages([...languages, v]);
      setNewLang("");
    }
  };

  const handleSave = () => {
    const next: HostProfile = {
      displayName: displayName.trim() || undefined,
      headline: headline.trim() || undefined,
      bio: bio.trim() || undefined,
      country: country.trim() || undefined,
      languages: languages.length > 0 ? languages : undefined,
      avatar: avatar || undefined,
      instagram: instagram.trim() || undefined,
      website: website.trim() || undefined,
    };
    saveHostProfile(next);
    setInitial(next);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Public host profile</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              This is what travelers see when they tap your name on a trip
              page.
            </p>
          </div>
        </div>
      </div>

      {/* Avatar + name + headline */}
      <div className="rounded-2xl border bg-white p-6 space-y-5">
        <h3 className="font-bold">Identity</h3>

        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted shrink-0">
            {avatar && (
              <Image
                src={avatar}
                alt={displayName}
                fill
                sizes="80px"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => avatarInputRef.current?.click()}
              className="gap-1.5"
            >
              <Camera className="h-3.5 w-3.5" />
              Change photo
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG / PNG · up to 4 MB
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Display name</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Sofia Martinez"
          />
        </div>

        <div className="space-y-2">
          <Label>Headline</Label>
          <Input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Adventure photographer hosting trips since 2019"
            maxLength={120}
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {headline.length}/120
          </p>
        </div>

        <div className="space-y-2">
          <Label>About you</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={6}
            placeholder="Tell travelers what makes your trips special — your background, what you love about hosting, what to expect."
            maxLength={1200}
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {bio.length}/1200
          </p>
        </div>
      </div>

      {/* Location + languages */}
      <div className="rounded-2xl border bg-white p-6 space-y-5">
        <h3 className="font-bold">Where & how</h3>

        <div className="space-y-2">
          <Label>Based in</Label>
          <Input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. Lisbon, Portugal"
          />
        </div>

        <div className="space-y-2">
          <Label>Languages spoken</Label>
          <div className="flex flex-wrap gap-2">
            {languages.map((l, i) => (
              <span
                key={l}
                className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium"
              >
                {l}
                <button
                  type="button"
                  onClick={() =>
                    setLanguages(languages.filter((_, idx) => idx !== i))
                  }
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remove language"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {languages.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                Add at least one so travelers know how you communicate.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              placeholder="e.g. English"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLanguage();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={addLanguage}
              disabled={!newLang.trim()}
              className="gap-1 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Social */}
      <div className="rounded-2xl border bg-white p-6 space-y-4">
        <div>
          <h3 className="font-bold">Social links</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Optional — surface where travelers can learn more about you.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <AtSign className="h-3.5 w-3.5" />
            Instagram
          </Label>
          <Input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/yourhandle"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Website
          </Label>
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 -mx-6 lg:-mx-0 bg-white border-t px-6 lg:px-0 py-4 flex justify-end gap-2">
        <Button
          onClick={handleSave}
          disabled={!dirty}
          size="lg"
          className="gap-2"
        >
          {savedToast ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
