import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { prisma } from "@/lib/prisma";
import { getProductSummary } from "@/lib/admin/products-query";
import { getRecentOrders } from "@/lib/admin/orders-query";
import { formatIDR, formatDateTime } from "@/lib/format";
import {
  AlertTriangleIcon,
  ClipboardListIcon,
  PackageIcon,
  UsersIcon,
} from "@/components/icons";

export default async function AdminDashboardPage() {
  const [summary, customerCount, orderCount, revenueAgg, lowStockVariants, recentOrders] = await Promise.all([
    getProductSummary(),
    prisma.user.count({ where: { role: "user" } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["paid", "processing", "shipped", "completed"] } },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 10 } },
      orderBy: { stock: "asc" },
      take: 5,
      include: { product: { select: { name: true, id: true } } },
    }),
    getRecentOrders(5),
  ]);

  const cards = [
    {
      label: "Total Produk",
      value: summary.total,
      icon: PackageIcon,
      tone: "bg-stone-900 text-white",
    },
    {
      label: "Total Pesanan",
      value: orderCount,
      icon: ClipboardListIcon,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Total Pelanggan",
      value: customerCount,
      icon: UsersIcon,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Pendapatan",
      value: formatIDR(Number(revenueAgg._sum.total ?? 0)),
      icon: PackageIcon,
      tone: "bg-stone-100 text-stone-700",
    },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" breadcrumbs={[{ label: "Dashboard" }]} />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
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

        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Pesanan Terbaru</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-stone-500 hover:text-stone-800">
              Lihat semua &rarr;
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-stone-400">Belum ada pesanan dari pelanggan.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-stone-100">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm hover:bg-stone-50/70"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-stone-800">
                        #{order.id.slice(-8).toUpperCase()}{" "}
                        <span className="font-normal text-stone-400">&middot; {order.customerName}</span>
                      </p>
                      <p className="text-xs text-stone-400">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-stone-800">{formatIDR(order.total)}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-900">Stok Menipis</h2>
              <Link href="/admin/inventory" className="text-xs font-medium text-stone-500 hover:text-stone-800">
                Lihat semua &rarr;
              </Link>
            </div>
            {lowStockVariants.length === 0 ? (
              <p className="mt-4 text-sm text-stone-400">Semua stok dalam kondisi aman.</p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-stone-100">
                {lowStockVariants.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <Link href={`/admin/products/${v.product.id}`} className="truncate font-medium text-stone-700 hover:underline">
                        {v.product.name}
                      </Link>
                      <p className="text-xs text-stone-400">{v.size} &middot; {v.color}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-sm font-medium ${v.stock === 0 ? "text-rose-600" : "text-amber-600"}`}>
                      <AlertTriangleIcon className="h-4 w-4" />
                      {v.stock} unit
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-stone-900">Ringkasan Produk</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-stone-500">Produk Aktif</span>
                <span className="font-medium text-stone-800">{summary.active}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-stone-500">Produk Draft</span>
                <span className="font-medium text-stone-800">{summary.draft}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-stone-500">Produk Habis</span>
                <span className="font-medium text-stone-800">{summary.outOfStock}</span>
              </li>
            </ul>
            <Link
              href="/admin/products/new"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
            >
              + Tambah Produk Baru
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
