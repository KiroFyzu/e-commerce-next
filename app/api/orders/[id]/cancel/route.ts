import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrderWithLiveStatus } from "@/lib/orders-query";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });

  const { id } = await params;
  const order = await getOrderWithLiveStatus(session.user.id, id);
  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });

  if (order.status !== "pending") {
    return NextResponse.json({ error: "Pesanan ini tidak bisa dibatalkan" }, { status: 409 });
  }

  await prisma.order.update({ where: { id: order.id }, data: { status: "cancelled" } });

  return NextResponse.json({ ok: true });
}
