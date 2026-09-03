import { notFound } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getOrderWithLiveStatus, ASSUMED_PAYMENT_TTL_MS } from "@/lib/orders-query";
import { StoreProvider } from "@/components/site/StoreProvider";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PaymentStatus } from "@/components/site/PaymentStatus";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const order = await getOrderWithLiveStatus(session.user.id, id);
  if (!order) notFound();

  const transaction = order.transactions[0] ?? null;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <StoreProvider>
      <div className="flex min-h-screen flex-col bg-paper">
        <Navbar
          userName={session?.user?.name ?? session?.user?.email ?? "Pengguna"}
          isAdmin={session?.user?.role === "admin"}
          onSignOut={handleSignOut}
        />

        <main className="flex-1">
          <PaymentStatus
            orderId={order.id}
            orderStatus={order.status}
            total={Number(order.total)}
            items={order.items.map((item) => ({
              name: item.productVariant.product.name,
              size: item.productVariant.size,
              color: item.productVariant.color,
              quantity: item.quantity,
              priceAtPurchase: Number(item.priceAtPurchase),
            }))}
            transaction={
              transaction
                ? {
                    status: transaction.status,
                    qrPayload: transaction.qrPayload,
                    amount: Number(transaction.amount),
                    createdAt: transaction.createdAt.toISOString(),
                  }
                : null
            }
            expiryMs={ASSUMED_PAYMENT_TTL_MS}
          />
        </main>

        <Footer />
      </div>
    </StoreProvider>
  );
}
