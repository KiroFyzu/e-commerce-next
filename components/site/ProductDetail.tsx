"use client";

import { useMemo, useState } from "react";
import { discountPercent, formatIDR, type ProductDetail as ProductDetailType } from "@/lib/catalog-data";
import { useStore } from "@/components/site/StoreProvider";
import { RatingStars } from "@/components/site/RatingStars";
import { ProductImage } from "@/components/site/ProductImage";
import { HeartIcon, BagIcon } from "@/components/icons";

export function ProductDetail({ product }: { product: ProductDetailType }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const images = product.images.length > 0 ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const wishlisted = isWishlisted(product.id);
  const pct = discountPercent(product.price, product.discountPrice);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.size === selectedSize && v.color === selectedColor),
    [product.variants, selectedSize, selectedColor]
  );

  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
  const canAddToCart = Boolean(selectedVariant) && availableStock > 0;

  async function handleAddToCart() {
    if (!selectedVariant) return;
    setAddError(null);
    try {
      await addToCart(selectedVariant.id, quantity);
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1600);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Gagal menambahkan ke keranjang");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-line-soft">
            <ProductImage src={images[activeImage]} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((src, index) => (
                <button
                  key={src + index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Lihat gambar ${index + 1}`}
                  aria-pressed={index === activeImage}
                  className={`aspect-square overflow-hidden rounded-lg border bg-line-soft transition-colors cursor-pointer ${
                    index === activeImage ? "border-ink" : "border-line hover:border-ink-soft"
                  }`}
                >
                  <ProductImage src={src} alt={`${product.name} thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-wide text-muted">
            {product.brand ? `${product.brand} • ${product.category}` : product.category}
          </p>
          <h1 className="mt-1 font-serif text-3xl text-ink">{product.name}</h1>

          {product.reviewCount > 0 && (
            <div className="mt-2">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold text-ink">
              {formatIDR(product.discountPrice ?? product.price)}
            </span>
            {product.discountPrice && (
              <>
                <span className="text-base text-muted line-through">{formatIDR(product.price)}</span>
                <span className="rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-white">
                  -{pct}%
                </span>
              </>
            )}
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
            {product.description}
          </p>

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink">Ukuran</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={size === selectedSize}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      size === selectedSize
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink hover:border-ink-soft"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink">Warna</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    aria-pressed={color === selectedColor}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      color === selectedColor
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink hover:border-ink-soft"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-muted">
            {canAddToCart ? `Stok tersedia: ${availableStock}` : "Stok habis untuk pilihan ini"}
          </p>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-line">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Kurangi jumlah"
                className="flex h-10 w-10 items-center justify-center text-ink hover:bg-line-soft cursor-pointer"
              >
                &minus;
              </button>
              <span className="w-10 text-center text-sm font-medium text-ink">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(availableStock || 1, q + 1))}
                aria-label="Tambah jumlah"
                className="flex h-10 w-10 items-center justify-center text-ink hover:bg-line-soft cursor-pointer"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-medium text-white shadow-md transition-colors duration-200 hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <BagIcon className="h-4 w-4" />
              {justAdded ? "Ditambahkan" : "Tambah ke Keranjang"}
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? "Hapus dari wishlist" : "Simpan ke wishlist"}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-line text-ink transition-colors hover:border-ink-soft cursor-pointer"
            >
              <HeartIcon filled={wishlisted} className={wishlisted ? "h-5 w-5 text-sale" : "h-5 w-5"} />
            </button>
          </div>

          {addError && <p className="mt-2 text-xs text-sale">{addError}</p>}
        </div>
      </div>
    </section>
  );
}
