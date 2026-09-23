export type ProductCategory = string;

export type ProductVariantDetail = {
  id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  image: string;
  sizes: string[];
  colors: string[];
  isNew?: boolean;
  isTrending?: boolean;
  stock: number;
  variants: ProductVariantDetail[];
};

export type ProductDetail = Product & {
  description: string;
  brand?: string;
  images: string[];
};

export const CATEGORIES: { label: string; value: ProductCategory | "Semua" }[] = [
  { label: "Semua", value: "Semua" },
  { label: "Pria", value: "Pria" },
  { label: "Wanita", value: "Wanita" },
  { label: "Sepatu", value: "Sepatu" },
  { label: "Aksesoris", value: "Aksesoris" },
];

export const KNOWN_COLOR_SWATCHES = [
  { label: "Hitam", value: "#18181b" },
  { label: "Putih", value: "#fafaf9" },
  { label: "Cokelat", value: "#78350f" },
  { label: "Coklat", value: "#78350f" },
  { label: "Coksu", value: "#a97551" },
  { label: "Krem", value: "#e7ddc9" },
  { label: "Cream", value: "#f5f0e1" },
  { label: "Light Brown", value: "#b08968" },
  { label: "Ginger", value: "#b5651d" },
  { label: "Navy", value: "#1e293b" },
  { label: "Biru Tua", value: "#1e3a5f" },
  { label: "Biru Muda", value: "#93c5fd" },
  { label: "Blue Baby", value: "#bfdbfe" },
  { label: "Merah", value: "#991b1b" },
  { label: "Merah Cabe", value: "#c81e3a" },
  { label: "Maroon", value: "#7f1d1d" },
  { label: "Maron", value: "#7f1d1d" },
  { label: "Salem", value: "#e0968f" },
  { label: "Abu", value: "#78716c" },
  { label: "Abu Tua", value: "#57534e" },
  { label: "Abu Muda", value: "#d6d3d1" },
  { label: "Abu Silver", value: "#b8b5b0" },
  { label: "Abu Misty", value: "#b0aca6" },
  { label: "Gray Soft", value: "#c5c2bd" },
  { label: "Kuning", value: "#eab308" },
  { label: "Hijau", value: "#16a34a" },
  { label: "Hijau Botol", value: "#14532d" },
  { label: "Soft Green", value: "#a8c9a1" },
  { label: "Soft Lilac", value: "#c9b8db" },
  { label: "Ungu", value: "#7c3aed" },
];

const COLOR_HEX_BY_NAME: Record<string, string> = Object.fromEntries(
  KNOWN_COLOR_SWATCHES.map((c) => [c.label.toLowerCase(), c.value])
);

const FALLBACK_SWATCH_HEX = "#d6d3d1";

export function getColorHex(name: string): string {
  return COLOR_HEX_BY_NAME[name.trim().toLowerCase()] ?? FALLBACK_SWATCH_HEX;
}

export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function discountPercent(price: number, discountPrice?: number): number {
  if (!discountPrice) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function formatSoldCount(count: number): string {
  if (count <= 0) return "0";
  if (count < 20) return String(count);
  if (count < 1000) return `${Math.floor(count / 10) * 10}+`;
  return `${Math.floor(count / 1000)} rb+`;
}
