import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ stock: z.coerce.number().int().min(0) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { variantId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Stok tidak valid" }, { status: 400 });
  }

  try {
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: parsed.data.stock },
    });
    return NextResponse.json({ variant });
  } catch {
    return NextResponse.json({ error: "Varian tidak ditemukan" }, { status: 404 });
  }
}
