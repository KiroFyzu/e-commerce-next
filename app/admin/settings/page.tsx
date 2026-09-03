import { auth } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CogIcon, TruckIcon, UserIcon } from "@/components/icons";

export default async function SettingsPage() {
  const session = await auth();

  const sections = [
    {
      icon: TruckIcon,
      title: "Pengiriman & Pembayaran",
      description: "Konfigurasi ongkos kirim dan integrasi KiPay (QRIS) akan tersedia di sini.",
    },
    {
      icon: CogIcon,
      title: "Preferensi Toko",
      description: "Nama toko, mata uang, dan pengaturan umum lainnya akan tersedia di sini.",
    },
  ];

  return (
    <>
      <AdminHeader title="Pengaturan" breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Pengaturan" }]} />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-stone-900">Akun Admin</h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white">
              <UserIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-stone-800">{session?.user?.name}</p>
              <p className="text-xs text-stone-400">{session?.user?.email}</p>
            </div>
          </div>
        </section>

        {sections.map((s) => (
          <section key={s.title} className="rounded-2xl border border-dashed border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-400">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-stone-800">{s.title}</h2>
                <p className="mt-1 text-sm text-stone-400">{s.description}</p>
              </div>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
