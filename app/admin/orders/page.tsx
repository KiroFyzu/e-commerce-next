import { AdminHeader } from "@/components/admin/AdminHeader";
import { FlashToast } from "@/components/admin/FlashToast";
import { Pagination } from "@/components/admin/Pagination";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { getFilteredOrders, getOrderSummary, type OrderStatusValue } from "@/lib/admin/orders-query";
import { DEFAULT_PAGE_SIZE } from "@/lib/admin/constants";
import { formatIDR } from "@/lib/format";
import { AlertTriangleIcon, ClipboardListIcon, PackageIcon, TruckIcon } from "@/components/icons";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (key: string) => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const page = Math.max(1, Number(get("page")) || 1);
  const pageSize = Number(get("pageSize")) || DEFAULT_PAGE_SIZE;
  const status = (get("status") as OrderStatusValue | "semua" | undefined) ?? "semua";
  const query = get("query");

  const [{ orders, total }, summary] = await Promise.all([
    getFilteredOrders({ query, status, page, pageSize }),
    getOrderSummary(),
  ]);

  const cards = [
    { label: "Total Pesanan", value: summary.total, icon: ClipboardListIcon, tone: "bg-stone-900 text-white" },
    { label: "Menunggu Pembayaran", value: summary.pending, icon: AlertTriangleIcon, tone: "bg-amber-50 text-amber-600" },
    { label: "Sedang Diproses", value: summary.active, icon: TruckIcon, tone: "bg-sky-50 text-sky-600" },
    { label: "Total Pendapatan", value: formatIDR(summary.revenue), icon: PackageIcon, tone: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <>
      <AdminHeader title="Pesanan" breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Pesanan" }]} />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <FlashToast />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.tone}`}>
                <card.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-stone-900">{card.value}</p>
                <p className="truncate text-xs font-medium text-stone-500">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white">
          <OrderFilters />
          <OrdersTable orders={orders} />
          <Pagination page={page} pageSize={pageSize} total={total} itemLabel="pesanan" />
        </div>
      </main>
    </>
  );
}
