import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyKipaySignature } from "@/lib/kipay";

type KipayWebhookPayload = {
  event: "transaction.paid" | "transaction.expired" | "webhook.test";
  sent_at: string;
  transaction?: { trx_id: string };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("X-Webhook-Signature");

  if (!verifyKipaySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Signature tidak valid" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as KipayWebhookPayload;

  if (payload.event === "webhook.test") {
    return NextResponse.json({ ok: true });
  }

  const trxId = payload.transaction?.trx_id;
  if (!trxId) return NextResponse.json({ ok: true });

  const transaction = await prisma.transaction.findUnique({ where: { kipayTrxId: trxId } });
  if (!transaction) return NextResponse.json({ ok: true });

  if (payload.event === "transaction.paid" && transaction.status === "pending") {
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "paid", paidAt: new Date() },
      }),
      prisma.order.update({ where: { id: transaction.orderId }, data: { status: "paid" } }),
    ]);
  } else if (payload.event === "transaction.expired" && transaction.status === "pending") {
    await prisma.$transaction([
      prisma.transaction.update({ where: { id: transaction.id }, data: { status: "expired" } }),
      prisma.order.update({ where: { id: transaction.orderId }, data: { status: "expired" } }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
