# FindIt – Lost & Found Telkom University Jakarta

## Update v2
1. `npm install` (ada dependensi baru: `lucide-react`).
2. Supabase → SQL Editor → jalankan `supabase/migration_v2.sql` (aman dijalankan ulang). Isinya: tabel bookmarks, blocks, reports, notifications, trigger notifikasi, dan Realtime untuk posts.
3. `npm run dev`

Instalasi baru: jalankan `schema.sql` dulu, lalu `migration_v2.sql`.

## Rute
/ Home · /explore · /messages(/:id) · /map · /history · /profile · /new · /post/:id(/edit)

## Fitur
Prioritas 1: auth, feed, post + multi foto, search/filter, denah SVG interaktif (4 lantai), chat realtime, claim, QR serah terima, riwayat.
Prioritas 2: bookmark, notifikasi (lonceng, realtime), edit/hapus post, dark mode, report post/user, block user, update status realtime, foto profil, layout responsif (sidebar jadi drawer di mobile).

## Deploy ke Vercel
Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Supabase → Authentication → URL Configuration: tambahkan URL Vercel.
