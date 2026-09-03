import { AdminHeader } from "@/components/admin/AdminHeader";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { ClipboardListIcon } from "@/components/icons";

export default function OrdersPage() {
  return (
    <>
      <AdminHeader title="Pesanan" breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Pesanan" }]} />
      <main className="flex-1 p-4 sm:p-6">
        <ComingSoon
          icon={ClipboardListIcon}
          title="Manajemen Pesanan segera hadir"
          description="Halaman untuk melacak dan memperbarui status pesanan pelanggan sedang dalam pengembangan."
        />
      </main>
    </>
  );
}
