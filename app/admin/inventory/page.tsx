import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Thumb } from "@/components/admin/Thumb";
import { VariantStockEditor } from "@/components/admin/VariantStockEditor";
import { prisma } from "@/lib/prisma";
import { formatIDR } from "@/lib/format";
import { stockLevelFor, STOCK_LEVEL_META, type StockLevel } from "@/lib/admin/constants";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const stockFilter = (Array.isArray(sp.stock) ? sp.stock[0] : sp.stock) as StockLevel | "semua" | undefined;

  const variants = await prisma.productVariant.findMany({
    orderBy: { stock: "asc" },
    include: { product: { select: { id: true, name: true, images: true, category: true } } },
  });

  const counts = { aman: 0, menipis: 0, habis: 0 } as Record<StockLevel, number>;
  for (const v of variants) counts[stockLevelFor(v.stock)] += 1;

  const filtered = stockFilter && stockFilter !== "semua"
    ? variants.filter((v) => stockLevelFor(v.stock) === stockFilter)
    : variants;

  return (
    <>
      <AdminHeader title="Inventori / Stok" breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Inventori" }]} />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(Object.keys(STOCK_LEVEL_META) as StockLevel[]).map((level) => (
            <Link
              key={level}
              href={`/admin/inventory?stock=${level}`}
              className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
                stockFilter === level ? "border-stone-900 bg-stone-50" : "border-stone-200 bg-white hover:bg-stone-50"
              }`}
            >
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STOCK_LEVEL_META[level].text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${STOCK_LEVEL_META[level].dot}`} />
                {STOCK_LEVEL_META[level].label}
              </span>
              <p className="mt-2 text-2xl font-semibold text-stone-900">{counts[level]}</p>
              <p className="text-xs text-stone-400">SKU</p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-200 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-stone-900">
              {stockFilter && stockFilter !== "semua" ? STOCK_LEVEL_META[stockFilter as StockLevel].label : "Semua SKU"}
            </h2>
            {stockFilter && (
              <Link href="/admin/inventory" className="text-xs font-medium text-stone-500 hover:text-stone-800">
                Reset filter
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-5 py-3 font-medium">Produk</th>
                  <th className="px-3 py-3 font-medium">Varian</th>
                  <th className="px-3 py-3 font-medium">SKU</th>
                  <th className="px-3 py-3 font-medium">Harga</th>
                  <th className="px-3 py-3 font-medium">Status Stok</th>
                  <th className="px-3 py-3 font-medium">Stok</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const level = stockLevelFor(v.stock);
                  const meta = STOCK_LEVEL_META[level];
                  return (
                    <tr key={v.id} className="border-t border-stone-100">
                      <td className="px-5 py-3">
                        <Link href={`/admin/products/${v.product.id}`} className="flex items-center gap-3 hover:underline">
                          <Thumb src={v.product.images[0]} alt={v.product.name} className="h-10 w-10" />
                          <span className="font-medium text-stone-800">{v.product.name}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-stone-600">{v.size} &middot; {v.color}</td>
                      <td className="px-3 py-3 text-stone-500">{v.sku}</td>
                      <td className="px-3 py-3 text-stone-600">{formatIDR(Number(v.price ?? 0))}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${meta.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <VariantStockEditor variantId={v.id} initialStock={v.stock} />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-stone-400">
                      Tidak ada SKU untuk filter ini.
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
