import { AdminHeader } from "@/components/admin/AdminHeader";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { TicketIcon } from "@/components/icons";

export default function CouponsPage() {
  return (
    <>
      <AdminHeader title="Kupon & Promo" breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Kupon & Promo" }]} />
      <main className="flex-1 p-4 sm:p-6">
        <ComingSoon
          icon={TicketIcon}
          title="Kupon & Promo segera hadir"
          description="Buat dan kelola kode diskon, promo musiman, dan penawaran khusus dari sini."
        />
      </main>
    </>
  );
}
