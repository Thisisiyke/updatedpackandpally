import { PhoneFrame } from "@/components/mobile/phone-frame";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30">
      <PhoneFrame>{children}</PhoneFrame>
    </div>
  );
}
