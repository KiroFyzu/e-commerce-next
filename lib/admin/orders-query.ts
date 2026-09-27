import { prisma } from "@/lib/prisma";

export type OrderStatusValue =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "expired";

export const ORDER_STATUS_VALUES: OrderStatusValue[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "expired",
];

export type AdminOrderListItem = {
  id: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  total: number;
  status: OrderStatusValue;
  transactionStatus: "pending" | "paid" | "expired" | "failed" | null;
  createdAt: string;
};

export type OrderFiltersInput = {
  query?: string;
  status?: OrderStatusValue | "semua";
  page?: number;
  pageSize?: number;
};

export async function getFilteredOrders(
  filters: OrderFiltersInput
): Promise<{ orders: AdminOrderListItem[]; total: number }> {
  const { query, status = "semua", page = 1, pageSize = 20 } = filters;

  const where: Record<string, unknown> = {};
  if (status !== "semua") where.status = status;

  const q = query?.trim();
  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { user: { is: { name: { contains: q, mode: "insensitive" } } } },
      { user: { is: { email: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
        transactions: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const orders: AdminOrderListItem[] = rows.map((o) => ({
    id: o.id,
    customerName: o.user.name,
    customerEmail: o.user.email,
    itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
    total: Number(o.total),
    status: o.status,
    transactionStatus: o.transactions[0]?.status ?? null,
    createdAt: o.createdAt.toISOString(),
  }));

  return { orders, total };
}

export async function getOrderSummary() {
  const [total, pending, active, revenueAgg] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: { in: ["paid", "processing", "shipped"] } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["paid", "processing", "shipped", "completed"] } },
    }),
  ]);

  return { total, pending, active, revenue: Number(revenueAgg._sum.total ?? 0) };
}

export type AdminOrderDetail = {
  id: string;
  status: OrderStatusValue;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; email: string };
  items: {
    id: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
  transactions: {
    id: string;
    kipayTrxId: string;
    amount: number;
    status: string;
    createdAt: string;
    paidAt: string | null;
  }[];
};

export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { productVariant: { include: { product: { select: { name: true } } } } } },
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) return null;

  return {
    id: order.id,
    status: order.status,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    shippingAddress: order.shippingAddress as AdminOrderDetail["shippingAddress"],
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: order.user,
    items: order.items.map((i) => ({
      id: i.id,
      productName: i.productVariant.product.name,
      size: i.productVariant.size,
      color: i.productVariant.color,
      quantity: i.quantity,
      priceAtPurchase: Number(i.priceAtPurchase),
    })),
    transactions: order.transactions.map((t) => ({
      id: t.id,
      kipayTrxId: t.kipayTrxId,
      amount: Number(t.amount),
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      paidAt: t.paidAt ? t.paidAt.toISOString() : null,
    })),
  };
}

export async function getRecentOrders(limit = 5): Promise<AdminOrderListItem[]> {
  const { orders } = await getFilteredOrders({ page: 1, pageSize: limit });
  return orders;
}
