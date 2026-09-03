import { prisma } from "@/lib/prisma";

export type CartLine = {
  id: string;
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  quantity: number;
};

export class CartError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function fetchCartItems(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: { productVariant: { include: { product: true } } },
    orderBy: { createdAt: "asc" },
  });
}

type RawCartItem = Awaited<ReturnType<typeof fetchCartItems>>[number];

function toCartLine(item: RawCartItem): CartLine {
  const { productVariant: v } = item;
  const unitPrice = v.price ? Number(v.price) : Number(v.product.discountPrice ?? v.product.basePrice);

  return {
    id: item.id,
    variantId: v.id,
    productId: v.product.id,
    slug: v.product.slug,
    name: v.product.name,
    image: v.product.images[0] ?? "",
    size: v.size,
    color: v.color,
    price: unitPrice,
    stock: v.stock,
    quantity: item.quantity,
  };
}

export async function getCartForUser(userId: string): Promise<CartLine[]> {
  const items = await fetchCartItems(userId);
  return items.map(toCartLine);
}

export async function addCartItem(
  userId: string,
  variantId: string,
  quantity: number
): Promise<CartLine[]> {
  if (quantity < 1) throw new CartError("Jumlah tidak valid");

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) throw new CartError("Varian produk tidak ditemukan", 404);

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productVariantId: { userId, productVariantId: variantId } },
  });

  const desiredQuantity = Math.min((existing?.quantity ?? 0) + quantity, variant.stock);
  if (desiredQuantity < 1) throw new CartError("Stok produk habis", 409);

  await prisma.cartItem.upsert({
    where: { userId_productVariantId: { userId, productVariantId: variantId } },
    create: { userId, productVariantId: variantId, quantity: desiredQuantity },
    update: { quantity: desiredQuantity },
  });

  return getCartForUser(userId);
}

export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<CartLine[]> {
  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { productVariant: true },
  });
  if (!item || item.userId !== userId) throw new CartError("Item keranjang tidak ditemukan", 404);

  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return getCartForUser(userId);
  }

  const clamped = Math.min(quantity, item.productVariant.stock);
  if (clamped < 1) throw new CartError("Stok produk habis", 409);

  await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity: clamped } });
  return getCartForUser(userId);
}

export async function removeCartItem(userId: string, cartItemId: string): Promise<CartLine[]> {
  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
  if (!item || item.userId !== userId) throw new CartError("Item keranjang tidak ditemukan", 404);

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  return getCartForUser(userId);
}

export async function clearCart(userId: string): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { userId } });
}
