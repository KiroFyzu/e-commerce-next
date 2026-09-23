"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  discountPercent,
  formatIDR,
  formatSoldCount,
  getColorHex,
  type ProductDetail as ProductDetailType,
} from "@/lib/catalog-data";
import { useStore } from "@/components/site/StoreProvider";
import { RatingStars } from "@/components/site/RatingStars";
import { ProductImage } from "@/components/site/ProductImage";
import {
  HeartIcon,
  BagIcon,
  ShareIcon,
  MinusIcon,
  PlusIcon,
  ChevronRightIcon,
} from "@/components/icons";

export function ProductDetail({ product }: { product: ProductDetailType }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const images = product.images.length > 0 ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [justShared, setJustShared] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const wishlisted = isWishlisted(product.id);
  const pct = discountPercent(product.price, product.discountPrice);
  const unitPrice = product.discountPrice ?? product.price;

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

  async function handleBuyNow() {
    if (!selectedVariant) return;
    setAddError(null);
    setBuyingNow(true);
    try {
      await addToCart(selectedVariant.id, quantity);
      router.push("/checkout");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Gagal memproses pesanan");
      setBuyingNow(false);
    }
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setJustShared(true);
      window.setTimeout(() => setJustShared(false), 1600);
    } catch {
      // share sheet dismissed or clipboard unavailable — nothing to recover
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-ink">
          Beranda
        </Link>
        <ChevronRightIcon className="h-3 w-3 shrink-0" />
        <span>{product.category}</span>
        <ChevronRightIcon className="h-3 w-3 shrink-0" />
        <span className="truncate text-ink-soft">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)_320px]">
        {/* Gallery */}
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-line-soft">
            <ProductImage src={images[activeImage]} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, index) => (
                <button
                  key={src + index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Lihat gambar ${index + 1}`}
                  aria-pressed={index === activeImage}
                  className={`aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-line-soft transition-colors cursor-pointer ${
                    index === activeImage ? "border-ink" : "border-line hover:border-ink-soft"
                  }`}
                >
                  <ProductImage src={src} alt={`${product.name} thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            {product.brand ? `${product.brand} • ${product.category}` : product.category}
          </p>
          <h1 className="mt-1 font-serif text-2xl leading-snug text-ink sm:text-3xl">{product.name}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {product.soldCount > 0 && <span>Terjual {formatSoldCount(product.soldCount)}</span>}
            {product.soldCount > 0 && product.reviewCount > 0 && <span className="text-line">&bull;</span>}
            {product.reviewCount > 0 && (
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold text-ink sm:text-3xl">{formatIDR(unitPrice)}</span>
            {product.discountPrice && (
              <>
                <span className="text-base text-muted line-through">{formatIDR(product.price)}</span>
                <span className="rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-white">
                  -{pct}%
                </span>
              </>
            )}
          </div>

          <div className="mt-6 border-t border-line-soft pt-6">
            {product.sizes.length > 0 && (
              <div>
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
                <p className="text-sm text-ink">
                  Pilih warna: <span className="font-medium">{selectedColor || "-"}</span>
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {product.colors.map((color) => {
                    const selected = color === selectedColor;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        aria-pressed={selected}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                          selected
                            ? "border-ink bg-line-soft ring-1 ring-inset ring-ink text-ink"
                            : "border-line text-ink-soft hover:border-ink-soft"
                        }`}
                      >
                        <span
                          className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                          style={{ backgroundColor: getColorHex(color) }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-line-soft pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink">Deskripsi Produk</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {product.description}
            </p>
          </div>
        </div>

        {/* Buy box */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-line-soft bg-surface p-5 shadow-sm">
            <p className="text-sm font-semibold text-ink">Atur jumlah dan catatan</p>

            <div className="mt-3 flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-line-soft">
                <ProductImage src={images[activeImage]} alt={product.name} />
              </div>
              <p className="text-sm text-ink-soft">
                {[selectedColor, selectedSize].filter(Boolean).join(", ") || product.name}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center rounded-lg border border-line">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Kurangi jumlah"
                  className="flex h-9 w-9 items-center justify-center text-ink hover:bg-line-soft cursor-pointer"
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </button>
                <span className="w-9 text-center text-sm font-medium text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock || 1, q + 1))}
                  aria-label="Tambah jumlah"
                  className="flex h-9 w-9 items-center justify-center text-ink hover:bg-line-soft cursor-pointer"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted">
                {canAddToCart ? `Stok: ${availableStock}` : "Stok habis"}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-4">
              <span className="text-sm text-ink-soft">Subtotal</span>
              <span className="text-base font-semibold text-ink">{formatIDR(unitPrice * quantity)}</span>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-medium text-white shadow-md transition-colors duration-200 hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <BagIcon className="h-4 w-4" />
                {justAdded ? "Ditambahkan" : "+ Keranjang"}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!canAddToCart || buyingNow}
                className="flex items-center justify-center rounded-lg border border-ink px-4 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:bg-line-soft disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {buyingNow ? "Memproses..." : "Beli Langsung"}
              </button>
            </div>

            {addError && <p className="mt-2 text-xs text-sale">{addError}</p>}

            <div className="mt-4 flex items-center justify-center gap-2 border-t border-line-soft pt-4">
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-pressed={wishlisted}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-ink-soft cursor-pointer"
              >
                <HeartIcon filled={wishlisted} className={wishlisted ? "h-4 w-4 text-sale" : "h-4 w-4"} />
                Wishlist
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-ink-soft cursor-pointer"
              >
                <ShareIcon className="h-4 w-4" />
                {justShared ? "Tersalin" : "Bagikan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
