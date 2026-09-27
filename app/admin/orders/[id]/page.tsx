import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FlashToast } from "@/components/admin/FlashToast";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { getAdminOrderById } from "@/lib/admin/orders-query";
import { formatDateTime, formatIDR } from "@/lib/format";

const TRX_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  paid: "Lunas",
  expired: "Kadaluarsa",
  failed: "Gagal",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const orderCode = `#${order.id.slice(-8).toUpperCase()}`;

  return (
    <>
      <AdminHeader
        title={`Pesanan ${orderCode}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Pesanan", href: "/admin/orders" },
          { label: orderCode },
        ]}
      />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <FlashToast />

        <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-stone-900">{orderCode}</h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-stone-500">Dibuat {formatDateTime(order.createdAt)}</p>
          </div>
          <OrderStatusControl orderId={order.id} status={order.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-stone-900">Item Pesanan</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
                      <th className="pb-2 pr-3 font-medium">Produk</th>
                      <th className="pb-2 pr-3 font-medium">Varian</th>
                      <th className="pb-2 pr-3 font-medium">Qty</th>
                      <th className="pb-2 pr-3 text-right font-medium">Harga</th>
                      <th className="pb-2 text-right font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-stone-100 last:border-0">
                        <td className="py-2.5 pr-3 font-medium text-stone-800">{item.productName}</td>
                        <td className="py-2.5 pr-3 text-stone-500">
                          {item.size} / {item.color}
                        </td>
                        <td className="py-2.5 pr-3 text-stone-600">{item.quantity}</td>
                        <td className="py-2.5 pr-3 text-right text-stone-600">
                          {formatIDR(item.priceAtPurchase)}
                        </td>
                        <td className="py-2.5 text-right font-medium text-stone-800">
                          {formatIDR(item.priceAtPurchase * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-1.5 border-t border-stone-100 pt-4 text-sm">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>{formatIDR(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Ongkos Kirim</span>
                  <span>{formatIDR(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-stone-900">
                  <span>Total</span>
                  <span>{formatIDR(order.total)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-stone-900">Riwayat Pembayaran</h2>
              {order.transactions.length === 0 ? (
                <p className="mt-3 text-sm text-stone-400">Belum ada transaksi pembayaran untuk pesanan ini.</p>
              ) : (
                <ul className="mt-4 flex flex-col divide-y divide-stone-100">
                  {order.transactions.map((trx) => (
                    <li key={trx.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-800">{trx.kipayTrxId}</p>
                        <p className="text-xs text-stone-400">
                          {formatDateTime(trx.createdAt)}
                          {trx.paidAt ? ` · Dibayar ${formatDateTime(trx.paidAt)}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-stone-800">{formatIDR(trx.amount)}</span>
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                          {TRX_STATUS_LABEL[trx.status] ?? trx.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-stone-900">Pelanggan</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Nama</dt>
                  <dd className="mt-0.5 text-stone-800">{order.customer.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Email</dt>
                  <dd className="mt-0.5 text-stone-800">{order.customer.email}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-stone-900">Alamat Pengiriman</h2>
              <div className="mt-4 space-y-1 text-sm">
                <p className="font-medium text-stone-800">
                  {order.shippingAddress.name} &middot; {order.shippingAddress.phone}
                </p>
                <p className="text-stone-600">{order.shippingAddress.address}</p>
                <p className="text-stone-600">
                  {order.shippingAddress.city} {order.shippingAddress.postalCode}
                </p>
                {order.shippingAddress.notes && (
                  <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-500">
                    Catatan: {order.shippingAddress.notes}
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
