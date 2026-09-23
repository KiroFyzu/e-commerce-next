import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createKipayTransaction } from "@/lib/kipay";
import { FLAT_SHIPPING_COST } from "@/lib/checkout-config";

const shippingAddressSchema = z.object({
  name: z.string().min(1, "Nama penerima wajib diisi"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  city: z.string().min(1, "Kota wajib diisi"),
  postalCode: z.string().min(1, "Kode pos wajib diisi"),
  notes: z.string().optional(),
});

const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  saveAddress: z.boolean().optional().default(false),
  addressId: z.string().optional().nullable(),
});

class CheckoutError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  const userId = session.user.id;

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  let order: { id: string; total: number };

  try {
    order = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { productVariant: { include: { product: true } } },
      });
      if (cartItems.length === 0) throw new CheckoutError("Keranjang kosong");

      const lines = cartItems.map((item) => {
        const v = item.productVariant;
        const price = v.price ? Number(v.price) : Number(v.product.discountPrice ?? v.product.basePrice);
        return { item, price };
      });

      const subtotal = lines.reduce((sum, l) => sum + l.price * l.item.quantity, 0);
      const total = subtotal + FLAT_SHIPPING_COST;

      const createdOrder = await tx.order.create({
        data: {
          userId,
          status: "pending",
          subtotal,
          shippingCost: FLAT_SHIPPING_COST,
          total,
          shippingAddress: parsed.data.shippingAddress,
        },
      });

      if (parsed.data.saveAddress) {
        const { name, phone, address, city, postalCode } = parsed.data.shippingAddress;
        const addressData = { name, phone, address, city, postalCode };
        const existing = parsed.data.addressId
          ? await tx.address.findUnique({ where: { id: parsed.data.addressId } })
          : null;

        if (existing && existing.userId === userId) {
          await tx.address.update({ where: { id: existing.id }, data: addressData });
        } else {
          await tx.address.create({ data: { ...addressData, userId } });
        }
      }

      for (const { item, price } of lines) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.productVariantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new CheckoutError(
            `Stok "${item.productVariant.product.name}" (${item.productVariant.size}/${item.productVariant.color}) tidak cukup`,
            409
          );
        }

        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            priceAtPurchase: price,
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return { id: createdOrder.id, total };
    });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  try {
    const kipayTx = await createKipayTransaction(Math.round(order.total), `Pesanan ${order.id}`);
    await prisma.transaction.create({
      data: {
        orderId: order.id,
        kipayTrxId: kipayTx.trx_id,
        qrPayload: kipayTx.qr_payload ?? "",
        amount: kipayTx.amount,
        status: "pending",
      },
    });
  } catch {
    return NextResponse.json(
      {
        orderId: order.id,
        error: "Pesanan dibuat tapi gagal membuat pembayaran QRIS. Coba lagi dari halaman pesanan.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
