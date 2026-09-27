import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_VALUES } from "@/lib/admin/orders-query";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") return null;
  return session;
}

const statusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES as [string, ...string[]]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status as (typeof ORDER_STATUS_VALUES)[number] },
    });
    return NextResponse.json({ order });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }
    throw err;
  }
}
