import { z } from "zod";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function randomSuffix() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

export const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, "Ukuran wajib diisi"),
  color: z.string().min(1, "Warna wajib diisi"),
  stock: z.coerce.number().int().min(0),
  price: z.coerce.number().positive().optional().nullable(),
  sku: z.string().min(1, "SKU varian wajib diisi"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(200),
  sku: z.string().max(60).optional().nullable(),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
  brand: z.string().max(100).optional().nullable(),
  basePrice: z.coerce.number().positive("Harga harus lebih dari 0"),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  weightGram: z.coerce.number().int().positive().optional().nullable(),
  status: z.enum(["active", "draft", "inactive", "archived"]).default("draft"),
  images: z.array(z.string().url("URL gambar tidak valid")).default([]),
  variants: z.array(variantSchema).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
