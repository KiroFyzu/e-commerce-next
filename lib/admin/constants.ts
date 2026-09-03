export const PRODUCT_CATEGORIES = ["Pria", "Wanita", "Sepatu", "Aksesoris"] as const;
export type ProductCategoryName = (typeof PRODUCT_CATEGORIES)[number];

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44", "45"] as const;

export function sizeOptionsForCategory(category: string): readonly string[] {
  if (category === "Sepatu") return SHOE_SIZES;
  if (category === "Aksesoris") return ["One Size"];
  return CLOTHING_SIZES;
}

export type ProductStatusValue = "active" | "draft" | "inactive" | "archived";

export const STATUS_META: Record<
  ProductStatusValue,
  { label: string; className: string }
> = {
  active: { label: "Aktif", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  draft: { label: "Draft", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  inactive: { label: "Nonaktif", className: "bg-stone-100 text-stone-600 ring-stone-500/20" },
  archived: { label: "Diarsipkan", className: "bg-stone-100 text-stone-500 ring-stone-500/20" },
};

export const OUT_OF_STOCK_META = {
  label: "Habis",
  className: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export const STOCK_THRESHOLD_LOW = 10;

export type StockLevel = "aman" | "menipis" | "habis";

export function stockLevelFor(totalStock: number): StockLevel {
  if (totalStock <= 0) return "habis";
  if (totalStock <= STOCK_THRESHOLD_LOW) return "menipis";
  return "aman";
}

export const STOCK_LEVEL_META: Record<
  StockLevel,
  { label: string; dot: string; text: string }
> = {
  aman: { label: "Stok Aman", dot: "bg-emerald-500", text: "text-emerald-700" },
  menipis: { label: "Stok Menipis", dot: "bg-amber-500", text: "text-amber-700" },
  habis: { label: "Habis", dot: "bg-rose-500", text: "text-rose-700" },
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;
