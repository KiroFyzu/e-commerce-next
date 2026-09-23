import type { ComponentType } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/orders-query";
import { getAddressesForUser } from "@/lib/address-query";
import { formatIDR, formatDate } from "@/lib/format";
import { StoreProvider } from "@/components/site/StoreProvider";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { DashboardAddresses } from "@/components/site/DashboardAddresses";
import { ClipboardListIcon, PackageIcon, TruckIcon, BagIcon } from "@/components/icons";

const SPENT_STATUSES = new Set(["paid", "processing", "shipped", "completed"]);

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [orders, addresses] = await Promise.all([
    getOrdersForUser(session.user.id),
    getAddressesForUser(session.user.id),
  ]);

  const totalSpent = orders
    .filter((order) => SPENT_STATUSES.has(order.status))
    .reduce((sum, order) => sum + order.total, 0);

  const displayName = session.user.name ?? session.user.email ?? "Pengguna";

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <StoreProvider>
      <div className="flex min-h-screen flex-col bg-paper">
        <Navbar
          userName={displayName}
          isAdmin={session.user.role === "admin"}
          onSignOut={handleSignOut}
        />

        <main className="flex-1">
          <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="font-serif text-3xl text-ink">Halo, {displayName}</h1>
            <p className="mt-1 text-sm text-ink-soft">Kelola pesanan, alamat, dan akun kamu di sini.</p>

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
              <StatCard icon={ClipboardListIcon} label="Total Pesanan" value={orders.length} />
              <StatCard icon={PackageIcon} label="Total Belanja" value={formatIDR(totalSpent)} />
              <StatCard icon={TruckIcon} label="Alamat Tersimpan" value={addresses.length} />
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <h2 className="font-serif text-lg text-ink">Riwayat Pesanan</h2>

                {orders.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line px-6 py-14 text-center">
                    <BagIcon className="h-10 w-10 text-muted" />
                    <p className="text-sm text-ink-soft">Kamu belum punya pesanan.</p>
                    <Link
                      href="/"
                      className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
                    >
                      Mulai Belanja
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="flex items-center justify-between gap-4 rounded-xl border border-line p-4 transition-colors hover:border-ink-soft"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-ink">#{order.id.slice(-8).toUpperCase()}</p>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <p className="mt-1 truncate text-sm text-ink-soft">{order.preview}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {formatDate(order.createdAt)} &middot; {order.itemCount} item
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold text-ink">{formatIDR(order.total)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-xl border border-line p-5">
                  <h2 className="font-serif text-lg text-ink">Profil</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Nama</dt>
                      <dd className="mt-0.5 text-ink">{displayName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Email</dt>
                      <dd className="mt-0.5 text-ink">{session.user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Peran</dt>
                      <dd className="mt-0.5 text-ink">
                        {session.user.role === "admin" ? "Admin" : "Pelanggan"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-line p-5">
                  <h2 className="font-serif text-lg text-ink">Alamat Tersimpan</h2>
                  <div className="mt-4">
                    <DashboardAddresses addresses={addresses} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href="/cart"
                    className="rounded-lg border border-line px-4 py-2.5 text-center text-sm font-medium text-ink hover:bg-line-soft"
                  >
                    Lihat Keranjang
                  </Link>
                  <Link
                    href="/"
                    className="rounded-lg border border-line px-4 py-2.5 text-center text-sm font-medium text-ink hover:bg-line-soft"
                  >
                    Lanjut Belanja
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </StoreProvider>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 sm:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold text-ink sm:text-2xl">{value}</p>
        <p className="truncate text-xs font-medium text-ink-soft">{label}</p>
      </div>
    </div>
  );
}
