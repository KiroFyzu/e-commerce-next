import { AlertTriangleIcon, CheckCircleIcon, PackageIcon, PencilIcon } from "@/components/icons";

export function SummaryCards({
  total,
  active,
  outOfStock,
  draft,
}: {
  total: number;
  active: number;
  outOfStock: number;
  draft: number;
}) {
  const cards = [
    { label: "Total Produk", value: total, icon: PackageIcon, tone: "bg-stone-900 text-white" },
    { label: "Produk Aktif", value: active, icon: CheckCircleIcon, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Produk Habis", value: outOfStock, icon: AlertTriangleIcon, tone: "bg-rose-50 text-rose-600" },
    { label: "Produk Draft", value: draft, icon: PencilIcon, tone: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5"
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.tone}`}>
            <card.icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-2xl font-semibold text-stone-900">{card.value}</p>
            <p className="truncate text-xs font-medium text-stone-500">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
