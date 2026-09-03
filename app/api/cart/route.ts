import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { addCartItem, getCartForUser, CartError } from "@/lib/cart-query";

const addSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });

  const cart = await getCartForUser(session.user.id);
  return NextResponse.json({ cart });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  try {
    const cart = await addCartItem(session.user.id, parsed.data.variantId, parsed.data.quantity);
    return NextResponse.json({ cart }, { status: 201 });
  } catch (err) {
    if (err instanceof CartError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
