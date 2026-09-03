import { AdminHeader } from "@/components/admin/AdminHeader";
import { SummaryCards } from "@/components/admin/SummaryCards";
import { FlashToast } from "@/components/admin/FlashToast";
import { Pagination } from "@/components/admin/Pagination";
import { PlusIcon } from "@/components/icons";
import { getFilteredProducts, getProductSummary, type ProductSort } from "@/lib/admin/products-query";
import { DEFAULT_PAGE_SIZE } from "@/lib/admin/constants";
import type { ProductStatusValue, StockLevel } from "@/lib/admin/constants";
import { ProductFilters } from "./ProductFilters";
import { ProductsTable } from "./ProductsTable";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (key: string) => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const page = Math.max(1, Number(get("page")) || 1);
  const pageSize = Number(get("pageSize")) || DEFAULT_PAGE_SIZE;

  const filters = {
    query: get("query"),
    category: get("category"),
    status: (get("status") as ProductStatusValue | "semua" | undefined) ?? "semua",
    stock: (get("stock") as StockLevel | "semua" | undefined) ?? "semua",
    minPrice: get("minPrice") ? Number(get("minPrice")) : undefined,
    maxPrice: get("maxPrice") ? Number(get("maxPrice")) : undefined,
    sort: (get("sort") as ProductSort | undefined) ?? "terbaru",
    page,
    pageSize,
  };

  const [{ products, total }, summary] = await Promise.all([
    getFilteredProducts(filters),
    getProductSummary(),
  ]);

  return (
    <>
      <AdminHeader
        title="Kelola Produk"
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Produk" }]}
        primaryAction={{
          label: "Tambah Produk",
          href: "/admin/products/new",
          icon: <PlusIcon className="h-4 w-4" />,
        }}
      />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <FlashToast />
        <SummaryCards {...summary} />

        <div className="rounded-2xl border border-stone-200 bg-white">
          <ProductFilters />
          <ProductsTable products={products} />
          <Pagination page={page} pageSize={pageSize} total={total} />
        </div>
      </main>
    </>
  );
}
