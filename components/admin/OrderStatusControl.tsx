"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/ToastProvider";
import type { OrderStatusValue } from "@/lib/admin/orders-query";

const STATUS_OPTIONS: { value: OrderStatusValue; label: string }[] = [
  { value: "pending", label: "Menunggu Pembayaran" },
  { value: "paid", label: "Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "expired", label: "Kadaluarsa" },
];

export function OrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatusValue }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (value === status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error ?? "Gagal memperbarui status", "error");
        setValue(status);
        return;
      }
      showToast("Status pesanan berhasil diperbarui");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value as OrderStatusValue)}
        disabled={saving}
        className="rounded-lg border border-stone-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-stone-700 focus:border-stone-900 focus:outline-none disabled:opacity-50 cursor-pointer"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || value === status}
        className="rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  );
}
