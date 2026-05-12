import { ShieldCheck } from "lucide-react";

export default function AccountSettingsPage() {
  return (
    <div className="rounded-2xl border bg-white p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-bold">Account &amp; security</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        Email, password, two-factor, active sessions, and account
        deactivation will live here. The auth wiring lands first; this editor
        plugs into it next.
      </p>
    </div>
  );
}
