"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import { CheckCircleIcon } from "@/components/icons";

export function VariantStockEditor({
  variantId,
  initialStock,
}: {
  variantId: string;
  initialStock: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [value, setValue] = useState(String(initialStock));
  const [saving, setSaving] = useState(false);
  const dirty = Number(value) !== initialStock && value !== "";

  async function save() {
    if (!dirty) return;
    setSaving(true);
    const res = await fetch(`/api/admin/variants/${variantId}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: Number(value) }),
    });
    setSaving(false);
    if (!res.ok) {
      showToast("Gagal memperbarui stok", "error");
      return;
    }
    showToast("Stok berhasil diperbarui");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className="w-20 rounded-lg border border-stone-200 px-2 py-1.5 text-sm focus:border-stone-900 focus:outline-none"
      />
      <button
        type="button"
        onClick={save}
        disabled={!dirty || saving}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 enabled:hover:bg-emerald-50 enabled:hover:text-emerald-600 disabled:opacity-30 cursor-pointer"
        aria-label="Simpan stok"
      >
        <CheckCircleIcon className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
