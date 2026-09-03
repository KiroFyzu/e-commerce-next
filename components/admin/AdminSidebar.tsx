"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BoxesIcon,
  ChartBarIcon,
  ClipboardListIcon,
  CogIcon,
  LayoutGridIcon,
  PackageIcon,
  TagIcon,
  TicketIcon,
  UsersIcon,
  XIcon,
} from "@/components/icons";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutGridIcon },
  { label: "Produk", href: "/admin/products", icon: PackageIcon },
  { label: "Kategori", href: "/admin/categories", icon: TagIcon },
  { label: "Pesanan", href: "/admin/orders", icon: ClipboardListIcon },
  { label: "Pelanggan", href: "/admin/customers", icon: UsersIcon },
  { label: "Kupon & Promo", href: "/admin/coupons", icon: TicketIcon },
  { label: "Inventori / Stok", href: "/admin/inventory", icon: BoxesIcon },
  { label: "Laporan", href: "/admin/reports", icon: ChartBarIcon },
  { label: "Pengaturan", href: "/admin/settings", icon: CogIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-stone-200 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 font-serif text-sm font-semibold text-white">
          L
        </span>
        <div className="leading-tight">
          <p className="font-serif text-base font-semibold text-stone-900">LUXE Admin</p>
          <p className="text-[11px] text-stone-400">Panel Manajemen Toko</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 ${
                      active ? "text-white" : "text-stone-400 group-hover:text-stone-600"
                    }`}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-stone-200 p-4">
        <Link
          href="/"
          className="block rounded-lg border border-stone-200 px-3 py-2.5 text-center text-xs font-medium text-stone-500 hover:bg-stone-50"
        >
          &larr; Kembali ke Toko
        </Link>
      </div>
    </>
  );
}

export function AdminSidebarDesktop() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
      <SidebarContent />
    </aside>
  );
}

export function AdminSidebarMobile({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <div className="absolute inset-0 bg-stone-900/40" onClick={onClose} aria-hidden="true" />
      <div className="relative flex h-full w-72 max-w-[80vw] flex-col bg-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer"
          aria-label="Tutup menu"
        >
          <XIcon className="h-5 w-5" />
        </button>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}
