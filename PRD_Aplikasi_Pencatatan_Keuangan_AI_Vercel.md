# PRD — Aplikasi Pencatatan Keuangan AI

## Ringkasan
Aplikasi pencatatan keuangan pribadi dengan **modern light UI**, **mobile-first**, dan **single deploy ke Vercel**. User bisa mencatat pemasukan/pengeluaran melalui **chat**, **foto struk**, dan **suara**.

## Tujuan
- Mencatat transaksi secepat mungkin dari mobile.
- Mengurangi friction input manual.
- Menyediakan dashboard keuangan yang sederhana dan jelas.
- Menjaga arsitektur tetap ringan: **1 repo, 1 app Next.js, 1 deploy Vercel**.

## Scope MVP
- Auth: username, email, password.
- Dashboard saldo + transaksi terbaru.
- Input transaksi via chat.
- Input transaksi via foto struk.
- Input transaksi via suara (voice to text -> ekstraksi transaksi).
- Review dan edit draft transaksi sebelum simpan.
- Histori transaksi + filter.
- Kategori dan akun dasar.
- Insight sederhana bulanan.

## Non-goals
- Bukan aplikasi akuntansi penuh.
- Belum native mobile app.
- Tidak auto-save tanpa review user.

## User Flow Inti
1. User daftar/login.
2. User pilih mode input: Chat / Foto / Suara.
3. Sistem membentuk draft transaksi.
4. User review dan edit.
5. User simpan.
6. Dashboard dan histori langsung ter-update.

## UI / UX Direction
- Light UI dominan putih/slate.
- Aksen teal/emerald.
- Bottom navigation.
- Card-based layout.
- CTA tambah transaksi selalu mudah dijangkau.
- Tampilan review berbentuk bottom sheet / card.
- Touch target besar, nyaman untuk 1 tangan.

## Tech Stack Rekomendasi
- **Next.js App Router + TypeScript**
- **Tailwind CSS + shadcn/ui**
- **Route Handlers + Server Actions**
- **Supabase** untuk Postgres + Auth + Storage
- **Vercel AI SDK + @ai-sdk/anthropic**
- **Zod + React Hook Form**
- **Recharts** untuk insight

## Kenapa Stack Ini Cocok
- Sangat umum dan mudah dibaca oleh Claude Opus 4.6.
- Full-stack dalam satu repo.
- Mudah deploy ke Vercel.
- Auth/storage tidak perlu bangun sendiri.
- Validasi output AI bisa dipaksa ke schema yang sama.

## Data Model Inti
- `profiles`
- `accounts`
- `categories`
- `transactions`
- `transaction_attachments`
- `ai_extraction_logs`

## Arsitektur
- Frontend + backend berada di **Next.js**.
- Auth, DB, storage di **Supabase**.
- Hosting di **Vercel Hobby**.
- AI parsing memakai **Anthropic**.
- Jalur suara MVP: **audio -> transkrip -> pipeline chat**.

## Setup Friendly
1. Buat project Supabase.
2. Aktifkan email/password auth.
3. Buat bucket `receipts`.
4. Buat tabel inti + RLS.
5. Buat project Next.js.
6. Install package: `@supabase/supabase-js`, `@supabase/ssr`, `ai`, `@ai-sdk/anthropic`, `zod`, `react-hook-form`.
7. Bangun auth pages.
8. Bangun dashboard & transaksi.
9. Bangun ingestion endpoint chat/photo/voice.
10. Hubungkan repo ke Vercel.
11. Tambahkan env vars.
12. Update redirect URL Supabase ke domain Vercel.

## Env Minimum
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `AI_MODEL`
- `NEXT_PUBLIC_APP_URL`

## Acceptance Criteria
- User bisa daftar dan login.
- User hanya melihat datanya sendiri.
- User bisa tambah transaksi via chat.
- User bisa tambah transaksi via foto.
- User bisa tambah transaksi via suara lewat jalur transkrip.
- Dashboard mobile rapi dan responsif.
- App berhasil deploy ke Vercel.

## Rekomendasi Akhir
Untuk MVP tercepat dan paling aman: **Next.js + Supabase + Vercel AI SDK + Anthropic**. Jalur suara dibuat sebagai **voice-to-text dulu**, lalu masuk ke pipeline parsing yang sama dengan chat agar implementasi tetap sederhana dan stabil.
