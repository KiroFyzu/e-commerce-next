"use client";

import Link from "next/link";
import { useState } from "react";
import { discountPercent, formatIDR, type Product } from "@/lib/catalog-data";
import { useStore } from "@/components/site/StoreProvider";
import { RatingStars } from "@/components/site/RatingStars";
import { HeartIcon, BagIcon } from "@/components/icons";
import { ProductImage } from "@/components/site/ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [justAdded, setJustAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const pct = discountPercent(product.price, product.discountPrice);

  function handleAddToCart() {
    addToCart(product.id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-line-soft">
        <Link href={`/products/${product.slug}`} className="block h-full w-full" aria-label={product.name}>
          <ProductImage src={product.image} alt={product.name} />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {pct > 0 && (
            <span className="pointer-events-auto rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-white">
              -{pct}%
            </span>
          )}
          {product.isNew && (
            <span className="pointer-events-auto rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-white">
              Baru
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? "Hapus dari wishlist" : "Simpan ke wishlist"}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-transform duration-200 hover:scale-105 cursor-pointer"
        >
          <HeartIcon filled={wishlisted} className={wishlisted ? "h-4.5 w-4.5 text-sale" : "h-4.5 w-4.5"} />
        </button>

        <div className="absolute inset-x-3 bottom-3 opacity-100 transition-all duration-300 ease-out md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2.5 text-sm font-medium text-white shadow-md transition-colors duration-200 hover:bg-ink-soft cursor-pointer"
          >
            <BagIcon className="h-4 w-4" />
            {justAdded ? "Ditambahkan" : "Tambah ke Keranjang"}
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted">{product.category}</p>
        <Link href={`/products/${product.slug}`} className="block text-sm font-medium text-ink hover:underline">
          {product.name}
        </Link>
        {product.reviewCount > 0 && (
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        )}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-semibold text-ink">
            {formatIDR(product.discountPrice ?? product.price)}
          </span>
          {product.discountPrice && (
            <span className="text-xs text-muted line-through">{formatIDR(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
