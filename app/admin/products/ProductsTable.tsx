"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SerializedProduct } from "@/lib/admin/products-query";
import { formatDate, formatIDR } from "@/lib/format";
import { PRODUCT_CATEGORIES } from "@/lib/admin/constants";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StockIndicator } from "@/components/admin/StockIndicator";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastProvider";
import {
  ArchiveBoxIcon,
  CopyIcon,
  DotsVerticalIcon,
  EyeIcon,
  PackageIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/icons";
import { Thumb } from "@/components/admin/Thumb";

type BulkAction =
  | "activate"
  | "deactivate"
  | "archive"
  | "delete"
  | "updateCategory"
  | "updatePrice"
  | "updateStock";

export function ProductsTable({ products }: { products: SerializedProduct[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkModal, setBulkModal] = useState<"updateCategory" | "updatePrice" | "updateStock" | null>(
    null
  );
  const [bulkValue, setBulkValue] = useState("");

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulk(action: BulkAction, payload?: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action, payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error ?? "Aksi massal gagal", "error");
        return;
      }
      showToast(bulkSuccessMessage(action));
      setSelected(new Set());
      setBulkModal(null);
      setBulkValue("");
      setConfirmBulkDelete(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error ?? "Gagal menghapus produk", "error");
        return;
      }
      showToast("Produk berhasil dihapus");
      setConfirmDelete(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive(id: string) {
    setOpenMenuId(null);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    if (!res.ok) {
      showToast("Gagal mengarsipkan produk", "error");
      return;
    }
    showToast("Produk berhasil diarsipkan");
    router.refresh();
  }

  async function handleDuplicate(id: string) {
    setOpenMenuId(null);
    const res = await fetch(`/api/admin/products/${id}/duplicate`, { method: "POST" });
    if (!res.ok) {
      showToast("Gagal menduplikat produk", "error");
      return;
    }
    showToast("Produk berhasil diduplikat");
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          <PackageIcon className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-stone-700">Tidak ada produk yang cocok</p>
        <p className="text-sm text-stone-400">Coba ubah kata kunci atau filter pencarian.</p>
      </div>
    );
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 bg-stone-50 px-4 py-3 sm:px-6">
          <span className="text-sm font-medium text-stone-700">{selected.size} dipilih</span>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => runBulk("activate")} disabled={busy} className="bulk-btn">
              Aktifkan
            </button>
            <button onClick={() => runBulk("deactivate")} disabled={busy} className="bulk-btn">
              Nonaktifkan
            </button>
            <button onClick={() => runBulk("archive")} disabled={busy} className="bulk-btn">
              Arsipkan
            </button>
            <button onClick={() => setBulkModal("updateCategory")} disabled={busy} className="bulk-btn">
              Ubah Kategori
            </button>
            <button onClick={() => setBulkModal("updatePrice")} disabled={busy} className="bulk-btn">
              Update Harga
            </button>
            <button onClick={() => setBulkModal("updateStock")} disabled={busy} className="bulk-btn">
              Update Stok
            </button>
            <button
              onClick={() => setConfirmBulkDelete(true)}
              disabled={busy}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-stone-300 accent-stone-900 cursor-pointer"
                  aria-label="Pilih semua produk"
                />
              </th>
              <th className="px-3 py-3 font-medium">Produk</th>
              <th className="px-3 py-3 font-medium">Kategori</th>
              <th className="px-3 py-3 font-medium">Harga</th>
              <th className="px-3 py-3 font-medium">Diskon</th>
              <th className="px-3 py-3 font-medium">Stok</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Diperbarui</th>
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/70">
                <td className="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleOne(product.id)}
                    className="h-4 w-4 rounded border-stone-300 accent-stone-900 cursor-pointer"
                    aria-label={`Pilih ${product.name}`}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Thumb src={product.images[0]} alt={product.name} className="h-12 w-12" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-800">{product.name}</p>
                      <p className="text-xs text-stone-400">{product.sku ?? "Tanpa SKU"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-stone-600">{product.category}</td>
                <td className="px-3 py-3 text-stone-800">{formatIDR(product.basePrice)}</td>
                <td className="px-3 py-3 text-stone-600">
                  {product.discountPrice ? (
                    <span className="font-medium text-rose-600">{formatIDR(product.discountPrice)}</span>
                  ) : (
                    <span className="text-stone-300">&mdash;</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <StockIndicator totalStock={product.totalStock} />
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={product.status} totalStock={product.totalStock} />
                </td>
                <td className="px-3 py-3 text-stone-500">{formatDate(product.updatedAt)}</td>
                <td className="relative px-3 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                    aria-label={`Aksi untuk ${product.name}`}
                  >
                    <DotsVerticalIcon className="h-4.5 w-4.5" />
                  </button>
                  {openMenuId === product.id && (
                    <RowActionsMenu
                      product={product}
                      onClose={() => setOpenMenuId(null)}
                      onDuplicate={() => handleDuplicate(product.id)}
                      onArchive={() => handleArchive(product.id)}
                      onDelete={() => setConfirmDelete({ id: product.id, name: product.name })}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="flex flex-col divide-y divide-stone-100 sm:hidden">
        {products.map((product) => (
          <li key={product.id} className="flex gap-3 px-4 py-4">
            <input
              type="checkbox"
              checked={selected.has(product.id)}
              onChange={() => toggleOne(product.id)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-stone-300 accent-stone-900 cursor-pointer"
              aria-label={`Pilih ${product.name}`}
            />
            <Thumb src={product.images[0]} alt={product.name} className="h-14 w-14" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-stone-800">{product.name}</p>
                  <p className="text-xs text-stone-400">{product.sku ?? "Tanpa SKU"} &middot; {product.category}</p>
                </div>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 cursor-pointer"
                    aria-label={`Aksi untuk ${product.name}`}
                  >
                    <DotsVerticalIcon className="h-4.5 w-4.5" />
                  </button>
                  {openMenuId === product.id && (
                    <RowActionsMenu
                      product={product}
                      onClose={() => setOpenMenuId(null)}
                      onDuplicate={() => handleDuplicate(product.id)}
                      onArchive={() => handleArchive(product.id)}
                      onDelete={() => setConfirmDelete({ id: product.id, name: product.name })}
                    />
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="text-sm font-medium text-stone-800">
                  {formatIDR(product.discountPrice ?? product.basePrice)}
                </span>
                {product.discountPrice && (
                  <span className="text-xs text-stone-400 line-through">{formatIDR(product.basePrice)}</span>
                )}
                <StockIndicator totalStock={product.totalStock} />
                <StatusBadge status={product.status} totalStock={product.totalStock} />
              </div>
              <p className="mt-1.5 text-xs text-stone-400">Diperbarui {formatDate(product.updatedAt)}</p>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus produk ini?"
        description={`"${confirmDelete?.name}" akan dihapus permanen dan tidak bisa dikembalikan.`}
        confirmLabel="Hapus"
        destructive
        loading={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.id)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Hapus ${selected.size} produk?`}
        description="Produk yang dipilih akan dihapus permanen dan tidak bisa dikembalikan."
        confirmLabel="Hapus"
        destructive
        loading={busy}
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={() => runBulk("delete")}
      />

      {bulkModal && (
        <BulkValueModal
          mode={bulkModal}
          value={bulkValue}
          onChange={setBulkValue}
          busy={busy}
          onClose={() => {
            setBulkModal(null);
            setBulkValue("");
          }}
          onSubmit={() => {
            if (bulkModal === "updateCategory") runBulk("updateCategory", { category: bulkValue });
            if (bulkModal === "updatePrice") runBulk("updatePrice", { price: Number(bulkValue) });
            if (bulkModal === "updateStock") runBulk("updateStock", { stock: Number(bulkValue) });
          }}
        />
      )}
    </div>
  );
}

function bulkSuccessMessage(action: BulkAction) {
  switch (action) {
    case "activate":
      return "Produk berhasil diaktifkan";
    case "deactivate":
      return "Produk berhasil dinonaktifkan";
    case "archive":
      return "Produk berhasil diarsipkan";
    case "delete":
      return "Produk berhasil dihapus";
    case "updateCategory":
      return "Kategori berhasil diperbarui";
    case "updatePrice":
      return "Harga berhasil diperbarui";
    case "updateStock":
      return "Stok berhasil diperbarui";
  }
}

function RowActionsMenu({
  product,
  onClose,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  product: SerializedProduct;
  onClose: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="absolute right-0 top-9 z-50 w-44 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg">
        <Link
          href={`/admin/products/${product.id}`}
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-stone-600 hover:bg-stone-50"
        >
          <EyeIcon className="h-4 w-4" /> Lihat
        </Link>
        <Link
          href={`/admin/products/${product.id}/edit`}
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-stone-600 hover:bg-stone-50"
        >
          <PencilIcon className="h-4 w-4" /> Edit
        </Link>
        <button
          type="button"
          onClick={onDuplicate}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-stone-600 hover:bg-stone-50 cursor-pointer"
        >
          <CopyIcon className="h-4 w-4" /> Duplikat
        </button>
        <button
          type="button"
          onClick={onArchive}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-stone-600 hover:bg-stone-50 cursor-pointer"
        >
          <ArchiveBoxIcon className="h-4 w-4" /> Arsipkan
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 cursor-pointer"
        >
          <TrashIcon className="h-4 w-4" /> Hapus
        </button>
      </div>
    </>
  );
}

function BulkValueModal({
  mode,
  value,
  onChange,
  busy,
  onClose,
  onSubmit,
}: {
  mode: "updateCategory" | "updatePrice" | "updateStock";
  value: string;
  onChange: (value: string) => void;
  busy: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const titles: Record<typeof mode, string> = {
    updateCategory: "Ubah Kategori",
    updatePrice: "Update Harga",
    updateStock: "Update Stok",
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-900/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-base font-semibold text-stone-900">{titles[mode]}</h2>
        <p className="mt-1 text-sm text-stone-500">
          Perubahan ini akan diterapkan ke seluruh produk yang dipilih.
        </p>

        <div className="mt-4">
          {mode === "updateCategory" ? (
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm focus:border-stone-900 focus:outline-none cursor-pointer"
            >
              <option value="">Pilih kategori</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              min={0}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={mode === "updatePrice" ? "Harga baru (Rp)" : "Jumlah stok baru"}
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm focus:border-stone-900 focus:outline-none"
            />
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy || !value}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
          >
            {busy ? "Memproses..." : "Terapkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
