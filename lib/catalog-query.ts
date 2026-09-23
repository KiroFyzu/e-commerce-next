import { prisma } from "@/lib/prisma";
import type { Product, ProductDetail } from "@/lib/catalog-data";

const NEW_WINDOW_MS = 21 * 24 * 60 * 60 * 1000;
const SECTION_SIZE = 8;

function fetchActiveProducts() {
  return prisma.product.findMany({
    where: { status: "active" },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });
}

type RawProduct = Awaited<ReturnType<typeof fetchActiveProducts>>[number];

async function getSoldCountByProductId(): Promise<Map<string, number>> {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productVariantId"],
    _sum: { quantity: true },
  });
  if (grouped.length === 0) return new Map();

  const variantIds = grouped.map((g) => g.productVariantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, productId: true },
  });
  const variantToProduct = new Map(variants.map((v) => [v.id, v.productId]));

  const soldByProduct = new Map<string, number>();
  for (const g of grouped) {
    const productId = variantToProduct.get(g.productVariantId);
    if (!productId) continue;
    const qty = g._sum.quantity ?? 0;
    soldByProduct.set(productId, (soldByProduct.get(productId) ?? 0) + qty);
  }
  return soldByProduct;
}

function mapProduct(product: RawProduct, soldCount = 0): Product {
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const colors = Array.from(new Set(product.variants.map((v) => v.color)));
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isNew = Date.now() - product.createdAt.getTime() < NEW_WINDOW_MS;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: Number(product.basePrice),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
    rating: 0,
    reviewCount: 0,
    soldCount,
    image: product.images[0] ?? "",
    sizes,
    colors,
    isNew,
    stock: totalStock,
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      price: v.price ? Number(v.price) : Number(product.basePrice),
      stock: v.stock,
    })),
  };
}

export async function getStorefrontCatalog(): Promise<{
  catalog: Product[];
  trending: Product[];
  newArrivals: Product[];
}> {
  const [rawProducts, soldByProduct] = await Promise.all([
    fetchActiveProducts(),
    getSoldCountByProductId(),
  ]);

  const catalog = rawProducts.map((p) => mapProduct(p, soldByProduct.get(p.id) ?? 0));

  const trendingIds = new Set(
    [...rawProducts]
      .sort((a, b) => {
        const soldA = soldByProduct.get(a.id) ?? 0;
        const soldB = soldByProduct.get(b.id) ?? 0;
        return soldB - soldA || b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(0, SECTION_SIZE)
      .map((p) => p.id)
  );

  const trending = catalog
    .filter((p) => trendingIds.has(p.id))
    .map((p) => ({ ...p, isTrending: true }));

  const newArrivals = catalog.slice(0, SECTION_SIZE);

  return { catalog, trending, newArrivals };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: { slug, status: "active" },
    include: { variants: true },
  });
  if (!product) return null;

  const soldByProduct = await getSoldCountByProductId();

  return {
    ...mapProduct(product, soldByProduct.get(product.id) ?? 0),
    description: product.description,
    brand: product.brand ?? undefined,
    images: product.images,
  };
}

export async function getRelatedProducts(
  category: string,
  excludeProductId: string,
  limit = 4
): Promise<Product[]> {
  const [rawProducts, soldByProduct] = await Promise.all([
    prisma.product.findMany({
      where: { status: "active", category, id: { not: excludeProductId } },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    getSoldCountByProductId(),
  ]);
  return rawProducts.map((p) => mapProduct(p, soldByProduct.get(p.id) ?? 0));
}
