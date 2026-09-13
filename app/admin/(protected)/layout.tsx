import { requireAdmin } from "@/lib/adminAuth";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 py-10">{children}</main>
    </div>
  );
}
