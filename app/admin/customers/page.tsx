import { AdminHeader } from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { UserIcon } from "@/components/icons";

export default async function CustomersPage() {
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <>
      <AdminHeader title="Pelanggan" breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Pelanggan" }]} />

      <main className="flex-1 p-4 sm:p-6">
        <div className="rounded-2xl border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-5 py-3 font-medium">Nama</th>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="px-3 py-3 font-medium">Jumlah Pesanan</th>
                  <th className="px-3 py-3 font-medium">Bergabung</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-stone-100">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                          <UserIcon className="h-4 w-4" />
                        </span>
                        <span className="font-medium text-stone-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-stone-500">{c.email}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                        {c.role === "admin" ? "Admin" : "Pelanggan"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-stone-600">{c._count.orders}</td>
                    <td className="px-3 py-3 text-stone-500">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-stone-400">
                      Belum ada pelanggan terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
