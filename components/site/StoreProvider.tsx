"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ProductCategory } from "@/lib/catalog-data";
import type { CartLine } from "@/lib/cart-query";

type StoreContextValue = {
  cart: CartLine[];
  cartLoading: boolean;
  wishlist: string[];
  cartCount: number;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: ProductCategory | "Semua";
  setSelectedCategory: (value: ProductCategory | "Semua") => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  lastAdded: string | null;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const WISHLIST_KEY = "luxe.wishlist";

async function parseCartResponse(res: Response): Promise<CartLine[]> {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? "Gagal memperbarui keranjang");
  }
  return body.cart as CartLine[];
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "Semua">("Semua");
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    // One-time hydration from localStorage after mount: initial state must stay
    // empty during SSR so the client's first render matches the server's.
    try {
      const storedWishlist = localStorage.getItem(WISHLIST_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    } catch {
      // ignore malformed local storage
    }

    fetch("/api/cart")
      .then((res) => parseCartResponse(res))
      .then((lines) => setCart(lines))
      .catch(() => {})
      .finally(() => setCartLoading(false));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  }, [wishlist]);

  const addToCart = useCallback(async (variantId: string, quantity = 1) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, quantity }),
    });
    const lines = await parseCartResponse(res);
    setCart(lines);
    setLastAdded(variantId);
  }, []);

  const updateCartQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    const res = await fetch(`/api/cart/${cartItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    const lines = await parseCartResponse(res);
    setCart(lines);
  }, []);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    const res = await fetch(`/api/cart/${cartItemId}`, { method: "DELETE" });
    const lines = await parseCartResponse(res);
    setCart(lines);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);

  const value = useMemo(
    () => ({
      cart,
      cartLoading,
      wishlist,
      cartCount,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      isWishlisted,
      toggleWishlist,
      lastAdded,
    }),
    [
      cart,
      cartLoading,
      wishlist,
      cartCount,
      searchQuery,
      selectedCategory,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      isWishlisted,
      toggleWishlist,
      lastAdded,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
