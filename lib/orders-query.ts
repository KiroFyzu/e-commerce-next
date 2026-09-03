import { prisma } from "@/lib/prisma";
import { getKipayTransaction } from "@/lib/kipay";

// KiPay sandbox transactions observed with a fixed 15-minute TTL; we don't persist
// expires_at (no schema change for this feature), so the countdown UI approximates
// it from createdAt. Actual expiry is still detected authoritatively via polling/webhook.
export const ASSUMED_PAYMENT_TTL_MS = 15 * 60 * 1000;

function fetchOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { productVariant: { include: { product: true } } } },
      transactions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export type OrderWithDetails = NonNullable<Awaited<ReturnType<typeof fetchOrder>>>;

export async function getOrderWithLiveStatus(
  userId: string,
  orderId: string
): Promise<OrderWithDetails | null> {
  const order = await fetchOrder(orderId);
  if (!order || order.userId !== userId) return null;

  const transaction = order.transactions[0];
  if (!transaction || transaction.status !== "pending") return order;

  try {
    const kipayTx = await getKipayTransaction(transaction.kipayTrxId);
    if (kipayTx.status === "paid" || kipayTx.status === "expired") {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: kipayTx.status,
            paidAt: kipayTx.status === "paid" ? new Date() : undefined,
          },
        }),
        prisma.order.update({ where: { id: order.id }, data: { status: kipayTx.status } }),
      ]);
      return fetchOrder(orderId);
    }
  } catch {
    // KiPay unreachable — fall back to whatever is currently in the DB.
  }

  return order;
}
