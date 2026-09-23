"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/site/StoreProvider";
import { OrderSummary } from "@/components/site/OrderSummary";
import type { SavedAddress } from "@/lib/address-query";

type FormState = {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
};

const EMPTY_FORM: FormState = { name: "", phone: "", address: "", city: "", postalCode: "", notes: "" };

function formFromAddress(a: SavedAddress, notes: string): FormState {
  return { name: a.name, phone: a.phone, address: a.address, city: a.city, postalCode: a.postalCode, notes };
}

export function CheckoutForm({ addresses: initialAddresses }: { addresses: SavedAddress[] }) {
  const { cart } = useStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedId, setSelectedId] = useState<string | null>(initialAddresses[0]?.id ?? null);
  const [form, setForm] = useState<FormState>(
    initialAddresses[0] ? formFromAddress(initialAddresses[0], "") : EMPTY_FORM
  );
  const [saveAddress, setSaveAddress] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectAddress(a: SavedAddress | null) {
    setSelectedId(a?.id ?? null);
    setForm((prev) => (a ? formFromAddress(a, prev.notes) : { ...EMPTY_FORM, notes: prev.notes }));
  }

  async function handleDeleteAddress(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Gagal menghapus alamat");
        return;
      }
      const remaining = addresses.filter((a) => a.id !== id);
      setAddresses(remaining);
      if (selectedId === id) {
        selectAddress(remaining[0] ?? null);
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            name: form.name,
            phone: form.phone,
            address: form.address,
            city: form.city,
            postalCode: form.postalCode,
            notes: form.notes || undefined,
          },
          saveAddress,
          addressId: selectedId,
        }),
      });
      const body = await res.json().catch(() => null);

      if (body?.orderId) {
        router.push(`/orders/${body.orderId}`);
        return;
      }
      setError(body?.error ?? "Gagal membuat pesanan");
    } catch {
      setError("Gagal membuat pesanan, periksa koneksi kamu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl text-ink">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
          <h2 className="font-serif text-lg text-ink">Alamat Pengiriman</h2>

          {addresses.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Alamat Tersimpan</p>
              {addresses.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                    selectedId === a.id ? "border-ink bg-line-soft" : "border-line"
                  }`}
                >
                  <label className="flex flex-1 cursor-pointer items-start gap-3">
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedId === a.id}
                      onChange={() => selectAddress(a)}
                      className="mt-1 h-4 w-4 accent-[#1c1917] cursor-pointer"
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="block font-medium text-ink">
                        {a.name} &middot; {a.phone}
                      </span>
                      <span className="block text-ink-soft line-clamp-2">
                        {a.address}, {a.city} {a.postalCode}
                      </span>
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(a.id)}
                    disabled={deletingId === a.id}
                    className="shrink-0 text-xs font-medium text-muted hover:text-sale disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => selectAddress(null)}
                className={`w-full rounded-lg border border-dashed px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  selectedId === null ? "border-ink text-ink" : "border-line text-ink-soft hover:border-ink-soft"
                }`}
              >
                + Alamat Baru
              </button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Penerima" value={form.name} onChange={(v) => update("name", v)} required />
            <Field
              label="Nomor Telepon"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              required
              type="tel"
            />
          </div>

          <Field
            label="Alamat Lengkap"
            value={form.address}
            onChange={(v) => update("address", v)}
            required
            textarea
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kota" value={form.city} onChange={(v) => update("city", v)} required />
            <Field label="Kode Pos" value={form.postalCode} onChange={(v) => update("postalCode", v)} required />
          </div>

          <Field label="Catatan (opsional)" value={form.notes} onChange={(v) => update("notes", v)} textarea />

          <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="h-4 w-4 rounded accent-[#1c1917] cursor-pointer"
            />
            Simpan alamat ini untuk pesanan berikutnya
          </label>

          {error && <p className="text-sm text-sale">{error}</p>}

          <button
            type="submit"
            disabled={submitting || cart.length === 0}
            className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Memproses..." : "Buat Pesanan & Bayar"}
          </button>
        </form>

        <div className="h-fit rounded-xl border border-line p-5">
          <h2 className="font-serif text-lg text-ink">Ringkasan Pesanan</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {cart.map((line) => (
              <li key={line.id} className="flex justify-between gap-2">
                <span className="line-clamp-1">
                  {line.name} ({line.size}/{line.color}) &times;{line.quantity}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <OrderSummary cart={cart} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={3}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
        />
      )}
    </label>
  );
}
