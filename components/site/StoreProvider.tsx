"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ProductCategory } from "@/lib/catalog-data";

type CartLine = { productId: string; quantity: number };

type StoreContextValue = {
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: ProductCategory | "Semua";
  setSelectedCategory: (value: ProductCategory | "Semua") => void;
  addToCart: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  lastAdded: string | null;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "luxe.cart";
const WISHLIST_KEY = "luxe.wishlist";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "Semua">("Semua");
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    // One-time hydration from localStorage after mount: initial state must stay
    // empty during SSR so the client's first render matches the server's.
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      const storedWishlist = localStorage.getItem(WISHLIST_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    } catch {
      // ignore malformed local storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  }, [wishlist]);

  const addToCart = useCallback((productId: string) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === productId);
      if (existing) {
        return prev.map((line) =>
          line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
    setLastAdded(productId);
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
      wishlist,
      cartCount,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      addToCart,
      isWishlisted,
      toggleWishlist,
      lastAdded,
    }),
    [
      cart,
      wishlist,
      cartCount,
      searchQuery,
      selectedCategory,
      addToCart,
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
