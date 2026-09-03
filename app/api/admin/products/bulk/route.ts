import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1, "Pilih minimal satu produk"),
  action: z.enum([
    "activate",
    "deactivate",
    "archive",
    "delete",
    "updateCategory",
    "updatePrice",
    "updateStock",
  ]),
  payload: z
    .object({
      category: z.string().optional(),
      price: z.coerce.number().positive().optional(),
      stock: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  const { ids, action, payload } = parsed.data;

  switch (action) {
    case "activate":
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status: "active" } });
      break;
    case "deactivate":
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status: "inactive" } });
      break;
    case "archive":
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status: "archived" } });
      break;
    case "delete":
      try {
        await prisma.product.deleteMany({ where: { id: { in: ids } } });
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err && err.code === "P2003") {
          return NextResponse.json(
            {
              error:
                "Sebagian produk memiliki riwayat pesanan dan tidak bisa dihapus. Arsipkan sebagai gantinya.",
            },
            { status: 409 }
          );
        }
        throw err;
      }
      break;
    case "updateCategory":
      if (!payload?.category) {
        return NextResponse.json({ error: "Kategori wajib diisi" }, { status: 400 });
      }
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { category: payload.category },
      });
      break;
    case "updatePrice":
      if (!payload?.price) {
        return NextResponse.json({ error: "Harga wajib diisi" }, { status: 400 });
      }
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { basePrice: payload.price },
      });
      break;
    case "updateStock":
      if (payload?.stock === undefined) {
        return NextResponse.json({ error: "Stok wajib diisi" }, { status: 400 });
      }
      await prisma.productVariant.updateMany({
        where: { productId: { in: ids } },
        data: { stock: payload.stock },
      });
      break;
  }

  return NextResponse.json({ ok: true, count: ids.length });
}
