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
  { label: "Hitam", value: "#1c1917" },
  { label: "Putih", value: "#fafaf9" },
  { label: "Cokelat", value: "#78350f" },
  { label: "Krem", value: "#e7ddc9" },
  { label: "Navy", value: "#1e293b" },
  { label: "Merah", value: "#991b1b" },
];

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
