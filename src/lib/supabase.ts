import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
export type Post = { id: string; user_id: string; title: string; description: string; category: string; photos: string[]; found_at: string; floor: number; room_id: string; location_note: string | null; status: 'belum_diambil' | 'sudah_diambil'; profiles?: { name: string } }
export const CATEGORIES = ['Dompet & Tas', 'Elektronik', 'Aksesoris', 'Dokumen & Kartu', 'Pakaian', 'Alat Tulis', 'Lainnya']
export const fmtDate = (s: string) => new Date(s).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) + ' WIB'
