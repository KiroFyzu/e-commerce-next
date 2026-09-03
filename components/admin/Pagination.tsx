"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { PAGE_SIZE_OPTIONS } from "@/lib/admin/constants";

export function Pagination({
  page,
  pageSize,
  total,
  itemLabel = "produk",
}: {
  page: number;
  pageSize: number;
  total: number;
  itemLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  function go(nextPage: number, nextPageSize?: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    if (nextPageSize) params.set("pageSize", String(nextPageSize));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-200 px-4 py-4 sm:flex-row sm:px-6">
      <p className="text-sm text-stone-500">
        Menampilkan <span className="font-medium text-stone-800">{start}</span>&ndash;
        <span className="font-medium text-stone-800">{end}</span> dari{" "}
        <span className="font-medium text-stone-800">{total}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-stone-500">
          Per halaman
          <select
            value={pageSize}
            onChange={(e) => go(1, Number(e.target.value))}
            className="rounded-lg border border-stone-200 bg-white py-1.5 pl-2 pr-7 text-sm text-stone-700 focus:border-stone-900 focus:outline-none cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(page - 1)}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span className="min-w-16 text-center text-sm text-stone-600">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => go(page + 1)}
            disabled={page >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            aria-label="Halaman berikutnya"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
