import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

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

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan gambar di server" }, { status: 500 });
  }

  return NextResponse.json({ url: `/uploads/products/${filename}` }, { status: 201 });
}
