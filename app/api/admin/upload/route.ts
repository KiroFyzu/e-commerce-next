import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadProductImage } from "@/lib/kipay-cdn";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") return null;
  return session;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File gambar wajib diisi" }, { status: 400 });
  }

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Format gambar tidak didukung (gunakan JPG, PNG, WEBP, atau GIF)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Ukuran gambar maksimal 5MB" }, { status: 400 });
  }

  const filename = `${randomUUID()}.${ext}`;

  let url: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    url = await uploadProductImage(buffer, filename, file.type);
  } catch {
    return NextResponse.json({ error: "Gagal mengunggah gambar ke CDN" }, { status: 500 });
  }

  return NextResponse.json({ url }, { status: 201 });
}
