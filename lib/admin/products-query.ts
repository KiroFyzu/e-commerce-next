import { prisma } from "@/lib/prisma";
import { stockLevelFor, type ProductStatusValue, type StockLevel } from "@/lib/admin/constants";

export type SerializedVariant = {
  id: string;
  size: string;
  color: string;
  price: number | null;
  stock: number;
  sku: string;
};

export type SerializedProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  category: string;
  brand: string | null;
  basePrice: number;
  discountPrice: number | null;
  weightGram: number | null;
  status: ProductStatusValue;
  images: string[];
  createdAt: string;
  updatedAt: string;
  variants: SerializedVariant[];
  totalStock: number;
  soldCount: number;
};

export type ProductSort =
  | "terbaru"
  | "harga-asc"
  | "harga-desc"
  | "stok-asc"
  | "stok-desc"
  | "terlaris";

export type ProductFiltersInput = {
  query?: string;
  category?: string;
  status?: ProductStatusValue | "semua";
  stock?: StockLevel | "semua";
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

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

function serialize(
  product: Awaited<ReturnType<typeof fetchRawProducts>>[number],
  soldByProduct: Map<string, number>
): SerializedProduct {
  const variants: SerializedVariant[] = product.variants.map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    price: v.price ? Number(v.price) : null,
    stock: v.stock,
    sku: v.sku,
  }));
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    category: product.category,
    brand: product.brand,
    basePrice: Number(product.basePrice),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    weightGram: product.weightGram,
    status: product.status,
    images: product.images,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants,
    totalStock,
    soldCount: soldByProduct.get(product.id) ?? 0,
  };
}

function fetchRawProducts(where: Record<string, unknown>) {
  return prisma.product.findMany({
    where,
    include: { variants: true },
  });
}

export async function getFilteredProducts(filters: ProductFiltersInput) {
  const {
    query,
    category,
    status,
    stock = "semua",
    minPrice,
    maxPrice,
    sort = "terbaru",
    page = 1,
    pageSize = 20,
  } = filters;

  const where: Record<string, unknown> = {};

  if (query && query.trim()) {
    where.OR = [
      { name: { contains: query.trim(), mode: "insensitive" } },
      { sku: { contains: query.trim(), mode: "insensitive" } },
      { variants: { some: { sku: { contains: query.trim(), mode: "insensitive" } } } },
    ];
  }
  if (category && category !== "Semua") {
    where.category = category;
  }
  if (status && status !== "semua") {
    where.status = status;
  }
  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    where.basePrice = {
      ...(typeof minPrice === "number" ? { gte: minPrice } : {}),
      ...(typeof maxPrice === "number" ? { lte: maxPrice } : {}),
    };
  }

  const [rawProducts, soldByProduct] = await Promise.all([
    fetchRawProducts(where),
    getSoldCountByProductId(),
  ]);

  let products = rawProducts.map((p) => serialize(p, soldByProduct));

  if (stock && stock !== "semua") {
    products = products.filter((p) => stockLevelFor(p.totalStock) === stock);
  }

  products.sort((a, b) => {
    switch (sort) {
      case "harga-asc":
        return (a.discountPrice ?? a.basePrice) - (b.discountPrice ?? b.basePrice);
      case "harga-desc":
        return (b.discountPrice ?? b.basePrice) - (a.discountPrice ?? a.basePrice);
      case "stok-asc":
        return a.totalStock - b.totalStock;
      case "stok-desc":
        return b.totalStock - a.totalStock;
      case "terlaris":
        return b.soldCount - a.soldCount;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const total = products.length;
  const start = (page - 1) * pageSize;
  const paged = products.slice(start, start + pageSize);

  return { products: paged, total };
}

export async function getProductById(id: string): Promise<SerializedProduct | null> {
  const product = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
  if (!product) return null;
  const soldByProduct = await getSoldCountByProductId();
  return serialize(product, soldByProduct);
}

export async function getProductSummary() {
  const [total, draft, allWithVariants] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "draft" } }),
    prisma.product.findMany({
      where: { status: "active" },
      select: { id: true, variants: { select: { stock: true } } },
    }),
  ]);

  let active = 0;
  let outOfStock = 0;
  for (const p of allWithVariants) {
    const stock = p.variants.reduce((sum, v) => sum + v.stock, 0);
    if (stock > 0) active += 1;
    else outOfStock += 1;
  }

  return { total, active, outOfStock, draft };
}

export async function getDistinctCategoriesWithCounts() {
  const products = await prisma.product.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  return products
    .map((p) => ({ category: p.category, count: p._count._all }))
    .sort((a, b) => b.count - a.count);
}
