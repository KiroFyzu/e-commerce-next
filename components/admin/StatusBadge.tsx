import { OUT_OF_STOCK_META, STATUS_META, type ProductStatusValue } from "@/lib/admin/constants";

export function StatusBadge({
  status,
  totalStock,
}: {
  status: ProductStatusValue;
  totalStock: number;
}) {
  const meta = status === "active" && totalStock <= 0 ? OUT_OF_STOCK_META : STATUS_META[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
