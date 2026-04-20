import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
