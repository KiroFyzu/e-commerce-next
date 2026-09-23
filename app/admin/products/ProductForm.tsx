"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SerializedProduct } from "@/lib/admin/products-query";
import { PRODUCT_CATEGORIES, sizeOptionsForCategory } from "@/lib/admin/constants";
import { KNOWN_COLOR_SWATCHES, getColorHex } from "@/lib/catalog-data";
import { PlusIcon, TrashIcon, UploadIcon } from "@/components/icons";
import { Thumb } from "@/components/admin/Thumb";

type VariantRow = {
  id?: string;
  size: string;
  color: string;
  stock: string;
  price: string;
  sku: string;
};

function emptyVariant(size: string): VariantRow {
  return { size, color: "", stock: "0", price: "", sku: "" };
}

export function ProductForm({
  mode,
  initialProduct,
}: {
  mode: "create" | "edit";
  initialProduct?: SerializedProduct;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [sku, setSku] = useState(initialProduct?.sku ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [category, setCategory] = useState(initialProduct?.category ?? PRODUCT_CATEGORIES[0]);
  const [brand, setBrand] = useState(initialProduct?.brand ?? "");
  const [basePrice, setBasePrice] = useState(initialProduct?.basePrice?.toString() ?? "");
  const [discountPrice, setDiscountPrice] = useState(
    initialProduct?.discountPrice?.toString() ?? ""
  );
  const [weightGram, setWeightGram] = useState(initialProduct?.weightGram?.toString() ?? "");
  const [status, setStatus] = useState(initialProduct?.status ?? "draft");
  const [images, setImages] = useState<string[]>(initialProduct?.images ?? []);
  const [imageInput, setImageInput] = useState("");
  const [variants, setVariants] = useState<VariantRow[]>(
    initialProduct?.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      stock: String(v.stock),
      price: v.price?.toString() ?? "",
      sku: v.sku,
    })) ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sizeOptions = sizeOptionsForCategory(category);

  function addImage() {
    const url = imageInput.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setImageInput("");
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant(sizeOptions[0] ?? "")]);
  }

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function suggestSku(index: number) {
    const v = variants[index];
    if (!v.size && !v.color) return;
    const base = (sku || name || "SKU").toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 16);
    const suggestion = `${base}-${v.size}-${v.color}`
      .toUpperCase()
      .replace(/[^A-Z0-9-]+/g, "")
      .replace(/-+/g, "-");
    updateVariant(index, { sku: suggestion });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (variants.length === 0) {
      setError("Tambahkan minimal satu varian (ukuran, warna, dan stok).");
      return;
    }
    for (const v of variants) {
      if (!v.color.trim() || !v.sku.trim()) {
        setError("Setiap varian wajib memiliki warna dan SKU.");
        return;
      }
    }

    setLoading(true);

    const payload = {
      name,
      sku: sku || null,
      description,
      category,
      brand: brand || null,
      basePrice: Number(basePrice),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      weightGram: weightGram ? Number(weightGram) : null,
      status,
      images,
      variants: variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        stock: Number(v.stock) || 0,
        price: v.price ? Number(v.price) : null,
        sku: v.sku,
      })),
    };

    const endpoint =
      mode === "create" ? "/api/admin/products" : `/api/admin/products/${initialProduct?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal menyimpan produk");
      return;
    }

    const flash =
      mode === "create" ? "Produk berhasil ditambahkan" : "Produk berhasil diperbarui";
    router.push(`/admin/products?flash=${encodeURIComponent(flash)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-stone-900">Informasi Produk</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nama Produk" required>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="SKU Produk">
            <input value={sku} onChange={(e) => setSku(e.target.value)} className="input" />
          </Field>
          <Field label="Kategori" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input cursor-pointer"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Brand">
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className="input" />
          </Field>
          <Field label="Status Produk" required>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="input cursor-pointer"
            >
              <option value="draft">Draft</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="archived">Diarsipkan</option>
            </select>
          </Field>
          <Field label="Berat Produk (gram)">
            <input
              type="number"
              min={0}
              value={weightGram}
              onChange={(e) => setWeightGram(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Deskripsi Produk" required className="sm:col-span-2">
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-stone-900">Harga</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Harga (Rp)" required>
            <input
              type="number"
              required
              min={0}
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Harga Diskon (Rp)">
            <input
              type="number"
              min={0}
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              className="input"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-stone-900">Gambar Produk</h2>
        <p className="mt-1 text-xs text-stone-400">
          Tambahkan URL gambar produk. Gambar pertama akan menjadi thumbnail utama.
        </p>

        <div className="mt-4 flex gap-2">
          <input
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
            placeholder="https://..."
            className="input flex-1"
          />
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3.5 text-sm font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
          >
            <UploadIcon className="h-4 w-4" />
            Tambah
          </button>
        </div>

        {images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={`${url}-${i}`} className="relative">
                <Thumb src={url} alt={`Gambar ${i + 1}`} className="h-20 w-20" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-white cursor-pointer"
                  aria-label="Hapus gambar"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Varian, Ukuran &amp; Stok</h2>
            <p className="mt-1 text-xs text-stone-400">
              {category === "Sepatu"
                ? "Tentukan ukuran sepatu, warna, dan stok tiap kombinasi."
                : "Tentukan ukuran pakaian, warna, dan stok tiap kombinasi."}
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
          >
            <PlusIcon className="h-4 w-4" />
            Tambah Varian
          </button>
        </div>

        <datalist id="known-color-swatches">
          {KNOWN_COLOR_SWATCHES.map((c) => (
            <option key={c.label} value={c.label} />
          ))}
        </datalist>

        {variants.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-stone-200 px-4 py-6 text-center text-sm text-stone-400">
            Belum ada varian. Klik &ldquo;Tambah Varian&rdquo; untuk menambahkan ukuran dan warna.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-stone-400">
                  <th className="pb-2 pr-3 font-medium">Ukuran</th>
                  <th className="pb-2 pr-3 font-medium">Warna</th>
                  <th className="pb-2 pr-3 font-medium">Stok</th>
                  <th className="pb-2 pr-3 font-medium">Harga Override</th>
                  <th className="pb-2 pr-3 font-medium">SKU Varian</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i} className="border-t border-stone-100">
                    <td className="py-2 pr-3">
                      <select
                        value={v.size}
                        onChange={(e) => updateVariant(i, { size: e.target.value })}
                        className="input cursor-pointer"
                      >
                        {sizeOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="relative">
                        <span
                          className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-black/10"
                          style={{ backgroundColor: getColorHex(v.color) }}
                          aria-hidden="true"
                        />
                        <input
                          value={v.color}
                          onChange={(e) => updateVariant(i, { color: e.target.value })}
                          onBlur={() => !v.sku && suggestSku(i)}
                          placeholder="Hitam"
                          list="known-color-swatches"
                          className="input pl-7"
                        />
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) => updateVariant(i, { stock: e.target.value })}
                        className="input w-24"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={0}
                        value={v.price}
                        onChange={(e) => updateVariant(i, { price: e.target.value })}
                        placeholder="Opsional"
                        className="input w-28"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        value={v.sku}
                        onChange={(e) => updateVariant(i, { sku: e.target.value })}
                        placeholder="SKU-VARIAN"
                        className="input"
                      />
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        aria-label="Hapus varian"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Menyimpan..." : mode === "create" ? "Simpan Produk" : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
