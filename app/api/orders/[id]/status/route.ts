import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrderWithLiveStatus } from "@/lib/orders-query";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });

  const { id } = await params;
  const order = await getOrderWithLiveStatus(session.user.id, id);
  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });

  const transaction = order.transactions[0] ?? null;

  return NextResponse.json({
    orderStatus: order.status,
    transaction: transaction
      ? {
          status: transaction.status,
          qrPayload: transaction.qrPayload,
          amount: Number(transaction.amount),
          createdAt: transaction.createdAt,
        }
      : null,
  });
}
