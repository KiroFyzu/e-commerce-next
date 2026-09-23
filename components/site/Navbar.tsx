"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BagIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
  XIcon,
} from "@/components/icons";
import { useStore } from "@/components/site/StoreProvider";

const NAV_LINKS = [
  { label: "Pria", href: "#produk-unggulan", category: "Pria" },
  { label: "Wanita", href: "#produk-unggulan", category: "Wanita" },
  { label: "Sepatu", href: "#produk-unggulan", category: "Sepatu" },
  { label: "Koleksi Terbaru", href: "#koleksi-terbaru" },
  { label: "Sale", href: "#sale" },
] as const;

export function Navbar({
  userName,
  isAdmin,
  onSignOut,
}: {
  userName: string;
  isAdmin: boolean;
  onSignOut: () => void;
}) {
  const { cartCount, wishlist, searchQuery, setSearchQuery, setSelectedCategory } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="border-b border-line-soft bg-ink py-2 text-center text-xs tracking-wide text-white">
        Gratis ongkir untuk pembelian pertama &mdash; kode <span className="font-semibold">LUXENEW</span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="mr-1 flex items-center justify-center rounded-lg p-2 text-ink hover:bg-line-soft lg:hidden cursor-pointer"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <XIcon /> : <MenuIcon />}
        </button>

        <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-ink">
          LUXE
        </Link>

        <nav className="ml-6 hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => {
                if ("category" in link) setSelectedCategory(link.category);
              }}
              className={
                link.label === "Sale"
                  ? "text-sm font-medium text-sale transition-colors hover:text-sale/80"
                  : "text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <label className="relative hidden flex-1 max-w-sm sm:flex" htmlFor="site-search">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="site-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk, kategori..."
              className="w-full rounded-full border border-line bg-surface py-2 pl-9 pr-4 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
            />
          </label>

          {isAdmin && (
            <Link
              href="/admin/products"
              className="hidden rounded-full border border-line px-3 py-1.5 text-sm text-ink-soft hover:bg-line-soft md:block"
            >
              Kelola Produk
            </Link>
          )}

          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${wishlist.length} produk`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-line-soft"
          >
            <HeartIcon />
            {wishlist.length > 0 && (
              <span
                role="status"
                aria-atomic="true"
                className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-semibold text-white"
              >
                {wishlist.length}
                <span className="sr-only"> produk di wishlist</span>
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            aria-label={`Keranjang, ${cartCount} item`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-line-soft"
          >
            <BagIcon />
            {cartCount > 0 && (
              <span
                role="status"
                aria-atomic="true"
                className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-white"
              >
                {cartCount}
                <span className="sr-only"> item di keranjang</span>
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-2 border-l border-line pl-3 sm:flex">
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-line-soft"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-line-soft text-ink-soft">
                <UserIcon className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-xs text-muted">Halo,</p>
                <p className="max-w-[9rem] truncate text-sm font-medium text-ink">{userName}</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="ml-1 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-line-soft cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>

      <label className="block px-4 pb-3 sm:hidden" htmlFor="site-search-mobile">
        <span className="relative flex">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="site-search-mobile"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk, kategori..."
            className="w-full rounded-full border border-line bg-surface py-2 pl-9 pr-4 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          />
        </span>
      </label>

      {mobileOpen && (
        <nav className="border-t border-line-soft px-4 py-3 lg:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => {
                    if ("category" in link) setSelectedCategory(link.category);
                    setMobileOpen(false);
                  }}
                  className={
                    link.label === "Sale"
                      ? "block rounded-lg px-2 py-2.5 text-sm font-medium text-sale"
                      : "block rounded-lg px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-line-soft"
                  }
                >
                  {link.label}
                </a>
              </li>
            ))}
            {isAdmin && (
              <li>
                <Link
                  href="/admin/products"
                  className="block rounded-lg px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-line-soft"
                >
                  Kelola Produk
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-line-soft"
              >
                Dashboard Saya
              </Link>
            </li>
            <li className="mt-1 flex items-center justify-between rounded-lg bg-line-soft px-2 py-2.5">
              <span className="text-sm text-ink-soft">{userName}</span>
              <button
                type="button"
                onClick={onSignOut}
                className="text-sm font-medium text-sale cursor-pointer"
              >
                Keluar
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
