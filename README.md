# E-Commerce Private Catalog (Fashion & Footwear)

Website e-commerce private (wajib login) untuk katalog baju & sepatu. Dibangun dengan Next.js App Router,
Prisma + Supabase Postgres, NextAuth (Auth.js) credentials, dan KiPay QRIS untuk pembayaran.

## Status

Tahap 1 selesai: scaffold project, skema database, autentikasi (register/login/logout), dan middleware
proteksi seluruh route kecuali `/login` & `/register`.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env` dan isi semua variabel:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` / `DIRECT_URL`: connection string dari project Supabase (Settings → Database).
     `DATABASE_URL` pakai connection pooler (port 6543), `DIRECT_URL` pakai direct connection (port 5432)
     — dibutuhkan Prisma untuk migration.
   - `NEXTAUTH_SECRET` / `AUTH_SECRET`: generate dengan `openssl rand -base64 32`.
   - `NEXTAUTH_URL`: URL aplikasi (`http://localhost:3000` untuk lokal).
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: dari
     Settings → API di project Supabase. Dipakai untuk upload gambar produk ke Supabase Storage.
   - `KIPAY_API_KEY`: API key dari dashboard KiPay.
   - `KIPAY_WEBHOOK_SECRET`: dibuat setelah menambahkan Webhook di dashboard project KiPay, dengan
     Webhook URL `https://<domain-produksi>/api/webhooks/kipay`.

3. Jalankan migration awal ke database Supabase:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Jalankan development server:

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) — akan redirect ke `/login` karena seluruh
   halaman diproteksi. Klik "Daftar" untuk membuat akun baru (self-register).

## Struktur Proyek

- `middleware.ts` — proteksi akses: memblokir semua route kecuali `/login`, `/register`, dan
  `/api/auth/*` (dibutuhkan NextAuth sendiri untuk proses login/register).
- `lib/auth.ts` — konfigurasi NextAuth (credentials provider, JWT session, callback role/id).
- `lib/prisma.ts` — Prisma client singleton.
- `prisma/schema.prisma` — skema database (User, Product, ProductVariant, CartItem, Order, OrderItem,
  Transaction).
- `app/login`, `app/register` — halaman publik autentikasi.
- `app/api/auth/register` — endpoint registrasi (validasi + hash password + create user).
- `app/api/auth/[...nextauth]` — handler NextAuth (login, session, logout).

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npx prisma studio          # lihat/edit data lewat UI
npx prisma migrate dev     # buat & jalankan migration baru
```

## Roadmap Berikutnya

- [x] Katalog produk (list, filter, detail, varian ukuran/warna)
- [x] Cart & checkout (persisted di database, per varian)
- [x] Integrasi KiPay (QRIS) + webhook + polling status
- [ ] Riwayat pesanan (list semua pesanan milik user)
- Admin panel (CRUD produk, kelola pesanan)
- Seed data dummy
