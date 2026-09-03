"use client";

import Link from "next/link";
import { formatIDR } from "@/lib/catalog-data";
import { useStore } from "@/components/site/StoreProvider";
import { ProductImage } from "@/components/site/ProductImage";
import { OrderSummary } from "@/components/site/OrderSummary";
import { TrashIcon, BagIcon } from "@/components/icons";

export function CartView() {
  const { cart, cartLoading, updateCartQuantity, removeFromCart } = useStore();

  if (cartLoading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-muted sm:px-6 lg:px-8">
        Memuat keranjang...
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-20 text-center sm:px-6 lg:px-8">
        <BagIcon className="h-12 w-12 text-muted" />
        <h1 className="font-serif text-2xl text-ink">Keranjang kamu kosong</h1>
        <p className="text-sm text-ink-soft">Yuk mulai belanja dan temukan produk favoritmu.</p>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-soft"
        >
          Kembali Belanja
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl text-ink">Keranjang Belanja</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.map((line) => (
            <div key={line.id} className="flex gap-4 rounded-xl border border-line p-3">
              <Link href={`/products/${line.slug}`} className="h-24 w-20 flex-none overflow-hidden rounded-lg bg-line-soft">
                <ProductImage src={line.image} alt={line.name} />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/products/${line.slug}`} className="text-sm font-medium text-ink hover:underline">
                    {line.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {line.size} / {line.color}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">{formatIDR(line.price)}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-line">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(line.id, line.quantity - 1)}
                      aria-label="Kurangi jumlah"
                      className="flex h-8 w-8 items-center justify-center text-ink hover:bg-line-soft cursor-pointer"
                    >
                      &minus;
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-ink">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(line.id, Math.min(line.quantity + 1, line.stock))}
                      disabled={line.quantity >= line.stock}
                      aria-label="Tambah jumlah"
                      className="flex h-8 w-8 items-center justify-center text-ink hover:bg-line-soft disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(line.id)}
                    aria-label="Hapus dari keranjang"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-line-soft hover:text-sale cursor-pointer"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-line p-5">
          <h2 className="font-serif text-lg text-ink">Ringkasan Pesanan</h2>
          <div className="mt-4">
            <OrderSummary cart={cart} />
          </div>

          <Link
            href="/checkout"
            className="mt-5 flex w-full items-center justify-center rounded-lg bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-ink-soft"
          >
            Lanjutkan ke Pembayaran
          </Link>
        </div>
      </div>
    </section>
  );
}
