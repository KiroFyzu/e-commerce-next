import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getDistinctCategoriesWithCounts } from "@/lib/admin/products-query";
import { PRODUCT_CATEGORIES } from "@/lib/admin/constants";
import { TagIcon } from "@/components/icons";

export default async function CategoriesPage() {
  const categoryCounts = await getDistinctCategoriesWithCounts();
  const countByName = new Map(categoryCounts.map((c) => [c.category, c.count]));

  return (
    <>
      <AdminHeader title="Kategori" breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Kategori" }]} />

      <main className="flex-1 p-4 sm:p-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <p className="text-sm text-stone-500">
            Kategori produk saat ini dikelola sebagai bagian dari form produk. Berikut jumlah
            produk pada setiap kategori.
          </p>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  href={`/admin/products?category=${encodeURIComponent(category)}`}
                  className="flex items-center gap-3 rounded-xl border border-stone-200 p-4 hover:bg-stone-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
                    <TagIcon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{category}</p>
                    <p className="text-xs text-stone-400">{countByName.get(category) ?? 0} produk</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
