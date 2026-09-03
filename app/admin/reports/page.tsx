import { AdminHeader } from "@/components/admin/AdminHeader";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { ChartBarIcon } from "@/components/icons";

export default function ReportsPage() {
  return (
    <>
      <AdminHeader title="Laporan" breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Laporan" }]} />
      <main className="flex-1 p-4 sm:p-6">
        <ComingSoon
          icon={ChartBarIcon}
          title="Laporan segera hadir"
          description="Analitik penjualan, produk terlaris, dan tren pendapatan akan tersedia di sini."
        />
      </main>
    </>
  );
}
