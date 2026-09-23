"use client";

import { useState } from "react";
import type { SavedAddress } from "@/lib/address-query";
import { TrashIcon } from "@/components/icons";

export function DashboardAddresses({ addresses: initial }: { addresses: SavedAddress[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Gagal menghapus alamat");
        return;
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  if (addresses.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        Belum ada alamat tersimpan. Alamat akan tersimpan otomatis saat kamu checkout.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-sale">{error}</p>}
      {addresses.map((a) => (
        <div key={a.id} className="flex items-start gap-3 rounded-lg border border-line p-3">
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-ink">
              {a.name} &middot; {a.phone}
            </p>
            <p className="text-ink-soft line-clamp-2">
              {a.address}, {a.city} {a.postalCode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(a.id)}
            disabled={deletingId === a.id}
            aria-label={`Hapus alamat ${a.name}`}
            className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-line-soft hover:text-sale disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
