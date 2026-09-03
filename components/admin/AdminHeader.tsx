"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BellIcon,
  ChevronRightIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/icons";
import { useMobileSidebar } from "@/components/admin/MobileSidebarContext";
import { useAdminSession } from "@/components/admin/AdminSessionContext";

type Breadcrumb = { label: string; href?: string };

const SAMPLE_NOTIFICATIONS = [
  { id: 1, text: "Stok “Chunky White Trainers” menipis (4 unit tersisa)", time: "5 menit lalu" },
  { id: 2, text: "3 pesanan baru menunggu diproses", time: "1 jam lalu" },
  { id: 3, text: "Produk “Linen Midi Dress” kehabisan stok", time: "Kemarin" },
];

export function AdminHeader({
  title,
  breadcrumbs,
  primaryAction,
}: {
  title: string;
  breadcrumbs: Breadcrumb[];
  primaryAction?: { label: string; href: string; icon?: React.ReactNode };
}) {
  const { open } = useMobileSidebar();
  const { name, email, signOutAction } = useAdminSession();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/admin/products?query=${encodeURIComponent(search.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={open}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 lg:hidden cursor-pointer"
          aria-label="Buka menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-400">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRightIcon className="h-3 w-3" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-stone-600">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-stone-500">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="truncate font-serif text-xl font-semibold text-stone-900">{title}</h1>
        </div>

        <form onSubmit={handleSearch} className="relative ml-auto hidden max-w-xs flex-1 sm:block">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk atau SKU..."
            className="w-full rounded-full border border-stone-200 bg-stone-50 py-2 pl-9 pr-4 text-sm text-stone-700 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none"
          />
        </form>

        <div className={`flex items-center gap-2 ${primaryAction ? "" : "ml-auto sm:ml-0"}`}>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer"
              aria-label="Notifikasi"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Notifikasi
                </p>
                <ul className="flex flex-col">
                  {SAMPLE_NOTIFICATIONS.map((n) => (
                    <li key={n.id} className="rounded-lg px-2 py-2 text-sm hover:bg-stone-50">
                      <p className="text-stone-700">{n.text}</p>
                      <p className="mt-0.5 text-xs text-stone-400">{n.time}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-stone-100 cursor-pointer"
            >
              <span className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-stone-900 text-white">
                <UserIcon className="h-4 w-4" />
              </span>
              <span className="hidden max-w-24 truncate text-sm font-medium text-stone-700 md:block">
                {name}
              </span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                <div className="border-b border-stone-100 px-2 py-2">
                  <p className="truncate text-sm font-medium text-stone-800">{name}</p>
                  <p className="truncate text-xs text-stone-400">{email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => signOutAction()}
                  className="mt-1 w-full rounded-lg px-2 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>

          {primaryAction && (
            <Link
              href={primaryAction.href}
              className="ml-1 flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
