import type { OrderListItem } from "@/lib/orders-query";

const STATUS_META: Record<OrderListItem["status"], { label: string; className: string }> = {
  pending: { label: "Menunggu Pembayaran", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  paid: { label: "Dibayar", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  processing: { label: "Diproses", className: "bg-sky-50 text-sky-700 ring-sky-600/20" },
  shipped: { label: "Dikirim", className: "bg-indigo-50 text-indigo-700 ring-indigo-600/20" },
  completed: { label: "Selesai", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  cancelled: { label: "Dibatalkan", className: "bg-stone-100 text-stone-600 ring-stone-500/20" },
  expired: { label: "Kadaluarsa", className: "bg-rose-50 text-rose-700 ring-rose-600/20" },
};

export function OrderStatusBadge({ status }: { status: OrderListItem["status"] }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
