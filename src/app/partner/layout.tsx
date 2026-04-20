import { PartnerSidebar } from "@/components/partner/partner-sidebar";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="hidden lg:block">
        <PartnerSidebar />
      </div>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
