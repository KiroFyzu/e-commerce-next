import { stockLevelFor, STOCK_LEVEL_META } from "@/lib/admin/constants";

export function StockIndicator({ totalStock }: { totalStock: number }) {
  const level = stockLevelFor(totalStock);
  const meta = STOCK_LEVEL_META[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium ${meta.text}`}
      title={meta.label}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {totalStock}
      <span className="text-xs font-normal text-stone-400">unit</span>
      <span className="sr-only"> &middot; {meta.label}</span>
    </span>
  );
}
