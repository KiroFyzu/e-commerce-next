"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "@/components/icons";

const STATUS_OPTIONS = [
  { value: "semua", label: "Semua Status" },
  { value: "pending", label: "Menunggu Pembayaran" },
  { value: "paid", label: "Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "expired", label: "Kadaluarsa" },
];

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const isFirstRun = useRef(true);
  const status = searchParams.get("status") ?? "semua";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || value === "semua") params.delete(key);
      else params.set(key, value);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const handle = setTimeout(() => updateParams({ query: query || null }), 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasFilters = status !== "semua" || !!searchParams.get("query");

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 p-4 sm:p-5">
      <div className="relative min-w-[220px] flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari ID pesanan, nama, atau email pelanggan..."
          className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-4 text-sm text-stone-700 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none"
        />
      </div>

      <div className="relative">
        <select
          value={status}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="rounded-lg border border-stone-200 bg-white py-2.5 pl-3.5 pr-9 text-sm font-medium text-stone-700 focus:border-stone-900 focus:outline-none cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push(pathname);
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 cursor-pointer"
        >
          <XIcon className="h-3.5 w-3.5" />
          Reset
        </button>
      )}
    </div>
  );
}
