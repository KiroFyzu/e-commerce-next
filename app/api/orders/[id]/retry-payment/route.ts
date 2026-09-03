import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createKipayTransaction } from "@/lib/kipay";
import { getOrderWithLiveStatus } from "@/lib/orders-query";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });

  const { id } = await params;
  const order = await getOrderWithLiveStatus(session.user.id, id);
  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });

  if (order.status === "paid" || order.status === "processing" || order.status === "completed") {
    return NextResponse.json({ error: "Pesanan ini sudah dibayar" }, { status: 409 });
  }

  try {
    const kipayTx = await createKipayTransaction(Math.round(Number(order.total)), `Pesanan ${order.id}`);
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          orderId: order.id,
          kipayTrxId: kipayTx.trx_id,
          qrPayload: kipayTx.qr_payload ?? "",
          amount: kipayTx.amount,
          status: "pending",
        },
      }),
      prisma.order.update({ where: { id: order.id }, data: { status: "pending" } }),
    ]);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat pembayaran baru, coba lagi" }, { status: 502 });
  }
}
