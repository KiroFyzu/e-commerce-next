import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { removeCartItem, updateCartItemQuantity, CartError } from "@/lib/cart-query";

const updateSchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });

  const { itemId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  try {
    const cart = await updateCartItemQuantity(session.user.id, itemId, parsed.data.quantity);
    return NextResponse.json({ cart });
  } catch (err) {
    if (err instanceof CartError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });

  const { itemId } = await params;

  try {
    const cart = await removeCartItem(session.user.id, itemId);
    return NextResponse.json({ cart });
  } catch (err) {
    if (err instanceof CartError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
