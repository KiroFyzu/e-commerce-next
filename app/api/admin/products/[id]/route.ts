import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema, slugify } from "../_shared";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") return null;
  return session;
}

const statusOnlySchema = z.object({
  status: z.enum(["active", "draft", "inactive", "archived"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const statusOnly = statusOnlySchema.safeParse(body);
  if (statusOnly.success && body && Object.keys(body).length === 1) {
    const product = await prisma.product.update({
      where: { id },
      data: { status: statusOnly.data.status },
    });
    return NextResponse.json({ product });
  }

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const current = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!current) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const slug = current.name === data.name ? current.slug : slugify(data.name);
  if (slug !== current.slug) {
    const clash = await prisma.product.findUnique({ where: { slug } });
    if (clash && clash.id !== id) {
      return NextResponse.json(
        { error: "Produk dengan nama serupa sudah ada" },
        { status: 409 }
      );
    }
  }

  const keepIds = data.variants.filter((v) => v.id).map((v) => v.id as string);
  const removedVariantIds = current.variants
    .map((v) => v.id)
    .filter((vid) => !keepIds.includes(vid));

  try {
    const product = await prisma.$transaction(async (tx) => {
      if (removedVariantIds.length > 0) {
        await tx.productVariant.deleteMany({ where: { id: { in: removedVariantIds } } });
      }

      for (const v of data.variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: { size: v.size, color: v.color, stock: v.stock, price: v.price ?? null, sku: v.sku },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              size: v.size,
              color: v.color,
              stock: v.stock,
              price: v.price ?? null,
              sku: v.sku,
            },
          });
        }
      }

      return tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug,
          sku: data.sku || null,
          description: data.description,
          category: data.category,
          brand: data.brand || null,
          basePrice: data.basePrice,
          discountPrice: data.discountPrice ?? null,
          weightGram: data.weightGram ?? null,
          status: data.status,
          images: data.images,
        },
      });
    });

    return NextResponse.json({ product });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "SKU produk atau varian sudah digunakan" },
        { status: 409 }
      );
    }
    throw err;
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });

  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2003") {
      return NextResponse.json(
        { error: "Produk memiliki riwayat pesanan dan tidak bisa dihapus. Arsipkan sebagai gantinya." },
        { status: 409 }
      );
    }
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    throw err;
  }
}
