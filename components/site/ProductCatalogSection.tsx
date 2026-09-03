"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  KNOWN_COLOR_SWATCHES,
  type Product,
} from "@/lib/catalog-data";
import { ProductCard } from "@/components/site/ProductCard";
import { useStore } from "@/components/site/StoreProvider";
import { ChevronDownIcon, FilterIcon, XIcon } from "@/components/icons";

const COLOR_HEX_BY_NAME: Record<string, string> = Object.fromEntries(
  KNOWN_COLOR_SWATCHES.map((c) => [c.label.toLowerCase(), c.value])
);

type SortOption = "populer" | "terbaru" | "harga-asc" | "harga-desc" | "rating";

const SORT_LABELS: Record<SortOption, string> = {
  populer: "Paling Populer",
  terbaru: "Terbaru",
  "harga-asc": "Harga: Rendah ke Tinggi",
  "harga-desc": "Harga: Tinggi ke Rendah",
  rating: "Rating Tertinggi",
};

function effectivePrice(product: Product) {
  return product.discountPrice ?? product.price;
}

export function ProductCatalogSection({ products }: { products: Product[] }) {
  const { searchQuery, setSearchQuery, selectedCategory: category, setSelectedCategory: setCategory } =
    useStore();
  const [sort, setSort] = useState<SortOption>("populer");
  const [maxPrice, setMaxPrice] = useState(1500000);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))).sort(),
    [products]
  );
  const availableColors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.colors))),
    [products]
  );

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function toggleColor(color: string) {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  }

  function resetFilters() {
    setCategory("Semua");
    setMaxPrice(1500000);
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinRating(0);
    setSearchQuery("");
  }

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = products.filter((product) => {
      if (category !== "Semua" && product.category !== category) return false;
      if (effectivePrice(product) > maxPrice) return false;
      if (selectedSizes.length > 0 && !product.sizes.some((s) => selectedSizes.includes(s)))
        return false;
      if (selectedColors.length > 0 && !product.colors.some((c) => selectedColors.includes(c)))
        return false;
      if (product.rating < minRating) return false;
      if (query && !product.name.toLowerCase().includes(query)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "harga-asc":
          return effectivePrice(a) - effectivePrice(b);
        case "harga-desc":
          return effectivePrice(b) - effectivePrice(a);
        case "rating":
          return b.rating - a.rating;
        case "terbaru":
          return Number(b.isNew) - Number(a.isNew);
        default:
          return Number(b.isTrending) - Number(a.isTrending) || b.reviewCount - a.reviewCount;
      }
    });

    return list;
  }, [products, category, maxPrice, selectedSizes, selectedColors, minRating, searchQuery, sort]);

  const activeFilterCount =
    (category !== "Semua" ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (minRating > 0 ? 1 : 0) +
    (maxPrice < 1500000 ? 1 : 0);

  return (
    <section id="produk-unggulan" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Produk Unggulan
          </p>
          <h2 className="mt-2 font-serif text-3xl text-ink">Jelajahi Semua Produk</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-line-soft cursor-pointer lg:hidden"
          >
            <FilterIcon className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <label className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none rounded-full border border-line bg-surface py-2.5 pl-4 pr-9 text-sm font-medium text-ink focus:border-ink focus:outline-none cursor-pointer"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </label>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside
          className={`${
            filtersOpen ? "block" : "hidden"
          } h-max rounded-2xl border border-line-soft bg-surface p-5 lg:sticky lg:top-28 lg:block`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Filter</h3>
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button type="button" onClick={resetFilters} className="text-xs font-medium text-gold cursor-pointer">
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="text-ink-soft lg:hidden cursor-pointer"
                aria-label="Tutup filter"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 border-t border-line-soft pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Kategori</h4>
            <div className="mt-3 flex flex-col gap-2">
              {CATEGORIES.map((item) => (
                <label key={item.value} className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === item.value}
                    onChange={() => setCategory(item.value)}
                    className="h-4 w-4 accent-[#1c1917]"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-line-soft pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Harga Maksimal</h4>
            <input
              type="range"
              min={200000}
              max={1500000}
              step={50000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full accent-[#1c1917]"
            />
            <p className="mt-1 text-sm text-ink-soft">
              Hingga Rp{maxPrice.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="mt-5 border-t border-line-soft pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Ukuran</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableSizes.length === 0 && (
                <p className="text-xs text-muted">Belum ada data ukuran.</p>
              )}
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                    selectedSizes.includes(size)
                      ? "border-ink bg-ink text-white"
                      : "border-line text-ink-soft hover:border-ink"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-line-soft pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Warna</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableColors.length === 0 && (
                <p className="text-xs text-muted">Belum ada data warna.</p>
              )}
              {availableColors.map((color) => {
                const hex = COLOR_HEX_BY_NAME[color.toLowerCase()];
                const selected = selectedColors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    aria-pressed={selected}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                      selected
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink-soft hover:border-ink"
                    }`}
                  >
                    <span
                      className={`h-3 w-3 shrink-0 rounded-full border ${
                        selected ? "border-white/40" : "border-line"
                      }`}
                      style={{ backgroundColor: hex ?? "#d6d3d1" }}
                      aria-hidden="true"
                    />
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 border-t border-line-soft pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Rating Minimum</h4>
            <div className="mt-3 flex flex-col gap-2">
              {[0, 4, 4.5].map((value) => (
                <label key={value} className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === value}
                    onChange={() => setMinRating(value)}
                    className="h-4 w-4 accent-[#1c1917]"
                  />
                  {value === 0 ? "Semua Rating" : `${value}+ ke atas`}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-20 text-center">
              <p className="text-sm font-medium text-ink">Produk tidak ditemukan</p>
              <p className="mt-1 text-sm text-muted">Coba ubah filter atau kata kunci pencarian.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-full border border-line px-5 py-2 text-sm font-medium text-ink hover:bg-line-soft cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
