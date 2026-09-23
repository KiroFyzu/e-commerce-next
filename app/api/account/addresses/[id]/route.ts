import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteAddressForUser } from "@/lib/address-query";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });

  const { id } = await params;

  try {
    await deleteAddressForUser(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Alamat tidak ditemukan" }, { status: 404 });
  }
}
