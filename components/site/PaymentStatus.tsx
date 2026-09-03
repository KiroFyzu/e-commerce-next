"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatIDR } from "@/lib/catalog-data";
import { CheckCircleIcon, XCircleIcon } from "@/components/icons";

type TransactionStatus = "pending" | "paid" | "expired" | "failed";
type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "expired";

type OrderItem = {
  name: string;
  size: string;
  color: string;
  quantity: number;
  priceAtPurchase: number;
};

type Transaction = {
  status: TransactionStatus;
  qrPayload: string;
  amount: number;
  createdAt: string;
};

const POLL_INTERVAL_MS = 4000;

function formatCountdown(msRemaining: number) {
  if (msRemaining <= 0) return "00:00";
  const totalSeconds = Math.floor(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function PaymentStatus({
  orderId,
  orderStatus: initialOrderStatus,
  total,
  items,
  transaction: initialTransaction,
  expiryMs,
}: {
  orderId: string;
  orderStatus: OrderStatus;
  total: number;
  items: OrderItem[];
  transaction: Transaction | null;
  expiryMs: number;
}) {
  const [orderStatus, setOrderStatus] = useState(initialOrderStatus);
  const [transaction, setTransaction] = useState(initialTransaction);
  const [now, setNow] = useState(() => Date.now());
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const isPending = orderStatus === "pending" && transaction?.status === "pending";

  useEffect(() => {
    if (!isPending) return;

    const interval = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        if (!res.ok) return;
        const body = await res.json();
        setOrderStatus(body.orderStatus);
        setTransaction(body.transaction);
      } catch {
        // ignore transient network errors, keep polling
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isPending, orderId]);

  useEffect(() => {
    if (!isPending) return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, [isPending]);

  async function handleRetry() {
    setRetrying(true);
    setRetryError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/retry-payment`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setRetryError(body?.error ?? "Gagal membuat pembayaran baru");
        return;
      }
      const statusRes = await fetch(`/api/orders/${orderId}/status`);
      const statusBody = await statusRes.json();
      setOrderStatus(statusBody.orderStatus);
      setTransaction(statusBody.transaction);
    } catch {
      setRetryError("Gagal membuat pembayaran baru, periksa koneksi kamu");
    } finally {
      setRetrying(false);
    }
  }

  if (orderStatus === "paid" || orderStatus === "processing" || orderStatus === "completed" || orderStatus === "shipped") {
    return (
      <section className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
        <CheckCircleIcon className="h-14 w-14 text-emerald-600" />
        <h1 className="font-serif text-2xl text-ink">Pembayaran Berhasil</h1>
        <p className="text-sm text-ink-soft">Pesanan #{orderId.slice(-8).toUpperCase()} sudah kami terima.</p>
        <OrderItemsList items={items} total={total} />
        <Link href="/" className="mt-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-soft">
          Kembali Belanja
        </Link>
      </section>
    );
  }

  const expired = orderStatus === "expired" || orderStatus === "cancelled" || transaction?.status === "expired";

  if (expired) {
    return (
      <section className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
        <XCircleIcon className="h-14 w-14 text-sale" />
        <h1 className="font-serif text-2xl text-ink">Pembayaran Kadaluarsa</h1>
        <p className="text-sm text-ink-soft">
          Waktu pembayaran untuk pesanan #{orderId.slice(-8).toUpperCase()} sudah habis.
        </p>
        {retryError && <p className="text-sm text-sale">{retryError}</p>}
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="mt-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {retrying ? "Memproses..." : "Coba Bayar Lagi"}
        </button>
      </section>
    );
  }

  if (!transaction) {
    return (
      <section className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-2xl text-ink">Pembayaran Belum Tersedia</h1>
        <p className="text-sm text-ink-soft">
          Pesanan #{orderId.slice(-8).toUpperCase()} dibuat, tapi QRIS pembayaran gagal dibuat.
        </p>
        {retryError && <p className="text-sm text-sale">{retryError}</p>}
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="mt-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {retrying ? "Memproses..." : "Buat Pembayaran"}
        </button>
      </section>
    );
  }

  const expiresAt = new Date(transaction.createdAt).getTime() + expiryMs;
  const msRemaining = expiresAt - now;

  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-12 text-center sm:px-6 lg:px-8">
      <h1 className="font-serif text-2xl text-ink">Scan untuk Bayar</h1>
      <p className="text-sm text-ink-soft">Gunakan aplikasi e-wallet atau mobile banking yang mendukung QRIS.</p>

      <div className="rounded-2xl border border-line bg-white p-5">
        <QRCodeSVG value={transaction.qrPayload} size={220} />
      </div>

      <p className="text-2xl font-semibold text-ink">{formatIDR(transaction.amount)}</p>
      <p className="text-xs text-muted">
        Bayar sesuai nominal di atas (termasuk kode unik) agar pembayaran terverifikasi otomatis.
      </p>
      <p className="text-sm font-medium text-ink-soft">Sisa waktu: {formatCountdown(msRemaining)}</p>

      <OrderItemsList items={items} total={total} />
    </section>
  );
}

function OrderItemsList({ items, total }: { items: OrderItem[]; total: number }) {
  return (
    <div className="mt-4 w-full rounded-xl border border-line p-4 text-left">
      <ul className="space-y-1.5 text-sm text-ink-soft">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between gap-2">
            <span className="line-clamp-1">
              {item.name} ({item.size}/{item.color}) &times;{item.quantity}
            </span>
            <span>{formatIDR(item.priceAtPurchase * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-between border-t border-line pt-2 text-sm font-semibold text-ink">
        <span>Total</span>
        <span>{formatIDR(total)}</span>
      </div>
    </div>
  );
}
