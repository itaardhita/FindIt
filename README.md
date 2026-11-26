# FindIt – Lost & Found Telkom University Jakarta

## Jalankan lokal
1. `npm install`
2. Salin `.env.example` ke `.env`, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (Supabase → Project Settings → API).
3. Supabase → SQL Editor → tempel isi `supabase/schema.sql` → Run.
4. (Opsional saat demo) Authentication → Providers → Email → matikan "Confirm email".
5. `npm run dev`

## Deploy ke Vercel
1. Push folder ini ke GitHub.
2. vercel.com → Add New Project → pilih repo (Framework: Vite).
3. Environment Variables: tambah `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
4. Deploy. `vercel.json` sudah menangani routing.
5. Scan kamera butuh HTTPS; Vercel sudah HTTPS.

## Alur serah terima
Pemilik tekan "Ini barang saya" → chat dengan penemu → verifikasi → saat bertemu, pemilik "Tampilkan QR" → penemu "Scan QR" (atau ketik kode) → status jadi "Sudah diambil", chat ditutup, postingan pindah ke riwayat.
