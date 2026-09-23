import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StockIndicator } from "@/components/admin/StockIndicator";
import { Thumb } from "@/components/admin/Thumb";
import { VariantStockEditor } from "@/components/admin/VariantStockEditor";
import { getProductById } from "@/lib/admin/products-query";
import { getColorHex } from "@/lib/catalog-data";
import { formatDateTime, formatIDR } from "@/lib/format";
import { PencilIcon } from "@/components/icons";

export default async function ViewProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <>
      <AdminHeader
        title={product.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produk", href: "/admin/products" },
          { label: product.name },
        ]}
        primaryAction={{
          label: "Edit Produk",
          href: `/admin/products/${product.id}/edit`,
          icon: <PencilIcon className="h-4 w-4" />,
        }}
      />

      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[280px_1fr]">
          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <Thumb
              src={product.images[0]}
              alt={product.name}
              className="aspect-square h-auto w-full"
            />
            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {product.images.slice(1).map((img, i) => (
                  <Thumb key={i} src={img} alt={`${product.name} ${i + 2}`} className="aspect-square h-auto w-full" />
                ))}
              </div>
            )}
          </section>

          <div className="space-y-6">
            <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl text-stone-900">{product.name}</h2>
                    <StatusBadge status={product.status} totalStock={product.totalStock} />
                  </div>
                  <p className="mt-1 text-sm text-stone-400">
                    {product.sku ?? "Tanpa SKU"} &middot; {product.category}
                    {product.brand ? ` · ${product.brand}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-stone-900">
                    {formatIDR(product.discountPrice ?? product.basePrice)}
                  </p>
                  {product.discountPrice && (
                    <p className="text-sm text-stone-400 line-through">{formatIDR(product.basePrice)}</p>
                  )}
                </div>
              </div>

              <p className="mt-4 whitespace-pre-line text-sm text-stone-600">{product.description}</p>

              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-stone-400">Total Stok</dt>
                  <dd className="mt-1"><StockIndicator totalStock={product.totalStock} /></dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-400">Terjual</dt>
                  <dd className="mt-1 font-medium text-stone-700">{product.soldCount} unit</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-400">Berat</dt>
                  <dd className="mt-1 font-medium text-stone-700">
                    {product.weightGram ? `${product.weightGram} gram` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-400">Diperbarui</dt>
                  <dd className="mt-1 font-medium text-stone-700">{formatDateTime(product.updatedAt)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-900">Varian &amp; Stok</h3>
                <Link href={`/admin/products/${product.id}/edit`} className="text-xs font-medium text-stone-500 hover:text-stone-800">
                  Kelola varian di halaman edit &rarr;
                </Link>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-stone-400">
                      <th className="pb-2 font-medium">Ukuran</th>
                      <th className="pb-2 font-medium">Warna</th>
                      <th className="pb-2 font-medium">SKU</th>
                      <th className="pb-2 font-medium">Harga</th>
                      <th className="pb-2 font-medium">Stok (quick update)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <tr key={v.id} className="border-t border-stone-100">
                        <td className="py-2.5">{v.size}</td>
                        <td className="py-2.5">
                          <span className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                              style={{ backgroundColor: getColorHex(v.color) }}
                              aria-hidden="true"
                            />
                            {v.color}
                          </span>
                        </td>
                        <td className="py-2.5 text-stone-500">{v.sku}</td>
                        <td className="py-2.5 text-stone-600">{v.price ? formatIDR(v.price) : "—"}</td>
                        <td className="py-2.5">
                          <VariantStockEditor variantId={v.id} initialStock={v.stock} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
