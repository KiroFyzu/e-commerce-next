"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog-data";
import { useStore } from "@/components/site/StoreProvider";
import { ProductCard } from "@/components/site/ProductCard";
import { HeartIcon } from "@/components/icons";

export function WishlistView({ products }: { products: Product[] }) {
  const { wishlist, wishlistLoading } = useStore();

  if (wishlistLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-muted sm:px-6 lg:px-8">
        Memuat wishlist...
      </section>
    );
  }

  const wishlisted = products.filter((p) => wishlist.includes(p.id));

  if (wishlisted.length === 0) {
    return (
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-20 text-center sm:px-6 lg:px-8">
        <HeartIcon className="h-12 w-12 text-muted" />
        <h1 className="font-serif text-2xl text-ink">Wishlist kamu kosong</h1>
        <p className="text-sm text-ink-soft">
          Simpan produk favoritmu dengan menekan ikon hati di halaman produk.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-soft"
        >
          Jelajahi Produk
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl text-ink">Wishlist Saya</h1>
      <p className="mt-1 text-sm text-ink-soft">{wishlisted.length} produk tersimpan.</p>

      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
        {wishlisted.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
