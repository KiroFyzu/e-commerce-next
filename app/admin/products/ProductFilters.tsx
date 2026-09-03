"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, SearchIcon, SlidersIcon, XIcon } from "@/components/icons";
import { PRODUCT_CATEGORIES } from "@/lib/admin/constants";

const STATUS_OPTIONS = [
  { value: "semua", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "draft", label: "Draft" },
  { value: "inactive", label: "Nonaktif" },
  { value: "archived", label: "Diarsipkan" },
];

const STOCK_OPTIONS = [
  { value: "semua", label: "Semua Stok" },
  { value: "aman", label: "Stok Aman" },
  { value: "menipis", label: "Stok Menipis" },
  { value: "habis", label: "Habis" },
];

const SORT_OPTIONS = [
  { value: "terbaru", label: "Produk Terbaru" },
  { value: "terlaris", label: "Produk Terlaris" },
  { value: "harga-asc", label: "Harga: Rendah ke Tinggi" },
  { value: "harga-desc", label: "Harga: Tinggi ke Rendah" },
  { value: "stok-asc", label: "Stok: Sedikit ke Banyak" },
  { value: "stok-desc", label: "Stok: Banyak ke Sedikit" },
];

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [panelOpen, setPanelOpen] = useState(false);
  const isFirstRun = useRef(true);

  const category = searchParams.get("category") ?? "Semua";
  const status = searchParams.get("status") ?? "semua";
  const stock = searchParams.get("stock") ?? "semua";
  const sort = searchParams.get("sort") ?? "terbaru";

  function updateParams(updates: Record<string, string | null>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || value === "semua" || value === "Semua") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    if (resetPage) params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const handle = setTimeout(() => {
      updateParams({ query: query || null });
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const activeFilterCount =
    (category !== "Semua" ? 1 : 0) +
    (status !== "semua" ? 1 : 0) +
    (stock !== "semua" ? 1 : 0) +
    (searchParams.get("minPrice") ? 1 : 0) +
    (searchParams.get("maxPrice") ? 1 : 0);

  function resetAll() {
    setQuery("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  }

  return (
    <div className="border-b border-stone-200 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama produk atau SKU..."
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-4 text-sm text-stone-700 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
        >
          <SlidersIcon className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="appearance-none rounded-lg border border-stone-200 bg-white py-2.5 pl-3.5 pr-9 text-sm font-medium text-stone-700 focus:border-stone-900 focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      {panelOpen && (
        <div className="mt-4 grid gap-4 rounded-xl border border-stone-100 bg-stone-50/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-stone-500">Kategori</span>
            <select
              value={category}
              onChange={(e) => updateParams({ category: e.target.value })}
              className="rounded-lg border border-stone-200 bg-white py-2 px-3 text-sm text-stone-700 focus:border-stone-900 focus:outline-none cursor-pointer"
            >
              <option value="Semua">Semua Kategori</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-stone-500">Status</span>
            <select
              value={status}
              onChange={(e) => updateParams({ status: e.target.value })}
              className="rounded-lg border border-stone-200 bg-white py-2 px-3 text-sm text-stone-700 focus:border-stone-900 focus:outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-stone-500">Stok</span>
            <select
              value={stock}
              onChange={(e) => updateParams({ stock: e.target.value })}
              className="rounded-lg border border-stone-200 bg-white py-2 px-3 text-sm text-stone-700 focus:border-stone-900 focus:outline-none cursor-pointer"
            >
              {STOCK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-stone-500">Rentang Harga (Rp)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => updateParams({ minPrice: minPrice || null })}
                placeholder="Min"
                className="w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-sm text-stone-700 focus:border-stone-900 focus:outline-none"
              />
              <span className="text-stone-300">&ndash;</span>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => updateParams({ maxPrice: maxPrice || null })}
                placeholder="Max"
                className="w-full rounded-lg border border-stone-200 bg-white py-2 px-3 text-sm text-stone-700 focus:border-stone-900 focus:outline-none"
              />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetAll}
              className="flex items-center gap-1.5 self-start text-sm font-medium text-stone-500 hover:text-stone-800 cursor-pointer lg:col-span-4"
            >
              <XIcon className="h-3.5 w-3.5" />
              Reset semua filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
