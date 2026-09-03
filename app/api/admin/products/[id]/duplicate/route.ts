import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomSuffix, slugify } from "../../_shared";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await params;
  const source = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
  if (!source) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const suffix = randomSuffix();
  const newName = `${source.name} (Copy)`;
  let slug = `${slugify(source.name)}-copy-${suffix.toLowerCase()}`;

  const clash = await prisma.product.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now()}`;

  const duplicate = await prisma.product.create({
    data: {
      name: newName,
      slug,
      sku: source.sku ? `${source.sku}-${suffix}` : null,
      description: source.description,
      category: source.category,
      brand: source.brand,
      basePrice: source.basePrice,
      discountPrice: source.discountPrice,
      weightGram: source.weightGram,
      status: "draft",
      images: source.images,
      variants: {
        create: source.variants.map((v) => ({
          size: v.size,
          color: v.color,
          stock: v.stock,
          price: v.price,
          sku: `${v.sku}-${suffix}`,
        })),
      },
    },
  });

  return NextResponse.json({ product: duplicate }, { status: 201 });
}
