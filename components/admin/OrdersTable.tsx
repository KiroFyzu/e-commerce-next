import Link from "next/link";
import type { AdminOrderListItem } from "@/lib/admin/orders-query";
import { formatDateTime, formatIDR } from "@/lib/format";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { ClipboardListIcon, EyeIcon } from "@/components/icons";

const TRX_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  paid: "Lunas",
  expired: "Kadaluarsa",
  failed: "Gagal",
};

export function OrdersTable({ orders }: { orders: AdminOrderListItem[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          <ClipboardListIcon className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-stone-700">Tidak ada pesanan yang cocok</p>
        <p className="text-sm text-stone-400">Coba ubah kata kunci atau filter status.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-3 font-medium">Pesanan</th>
              <th className="px-3 py-3 font-medium">Pelanggan</th>
              <th className="px-3 py-3 font-medium">Item</th>
              <th className="px-3 py-3 font-medium">Total</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Pembayaran</th>
              <th className="px-3 py-3 font-medium">Tanggal</th>
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/70">
                <td className="px-4 py-3 font-medium text-stone-800">
                  #{order.id.slice(-8).toUpperCase()}
                </td>
                <td className="px-3 py-3">
                  <p className="truncate font-medium text-stone-800">{order.customerName}</p>
                  <p className="truncate text-xs text-stone-400">{order.customerEmail}</p>
                </td>
                <td className="px-3 py-3 text-stone-600">{order.itemCount}</td>
                <td className="px-3 py-3 text-stone-800">{formatIDR(order.total)}</td>
                <td className="px-3 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-3 py-3 text-stone-600">
                  {order.transactionStatus ? TRX_STATUS_LABEL[order.transactionStatus] : "—"}
                </td>
                <td className="px-3 py-3 text-stone-500">{formatDateTime(order.createdAt)}</td>
                <td className="px-3 py-3 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    aria-label={`Lihat pesanan #${order.id.slice(-8).toUpperCase()}`}
                  >
                    <EyeIcon className="h-4.5 w-4.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="flex flex-col divide-y divide-stone-100 sm:hidden">
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/admin/orders/${order.id}`} className="flex flex-col gap-2 px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-stone-800">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="truncate text-xs text-stone-400">
                    {order.customerName} &middot; {order.customerEmail}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">{order.itemCount} item</span>
                <span className="font-medium text-stone-800">{formatIDR(order.total)}</span>
              </div>
              <p className="text-xs text-stone-400">{formatDateTime(order.createdAt)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
