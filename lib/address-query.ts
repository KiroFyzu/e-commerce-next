import { prisma } from "@/lib/prisma";

export type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  updatedAt: string;
};

export type AddressInput = {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
};

function serialize(row: AddressInput & { id: string; updatedAt: Date }): SavedAddress {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    postalCode: row.postalCode,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getAddressesForUser(userId: string): Promise<SavedAddress[]> {
  const rows = await prisma.address.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(serialize);
}

export async function deleteAddressForUser(userId: string, addressId: string): Promise<void> {
  const existing = await prisma.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Alamat tidak ditemukan");
  }
  await prisma.address.delete({ where: { id: addressId } });
}
