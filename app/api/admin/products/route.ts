import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema, slugify } from "./_shared";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { variants: true } } },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = slugify(data.name);

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Produk dengan nama serupa sudah ada" },
      { status: 409 }
    );
  }

  try {
    const product = await prisma.product.create({
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
        variants: {
          create: data.variants.map((v) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            price: v.price ?? null,
            sku: v.sku,
          })),
        },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
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
