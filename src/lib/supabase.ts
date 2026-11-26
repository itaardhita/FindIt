import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
export type Profile = { id: string; name: string; avatar_url: string | null }
export type Post = { id: string; user_id: string; title: string; description: string; category: string; photos: string[]; found_at: string; floor: number; room_id: string; location_note: string | null; status: 'belum_diambil' | 'sudah_diambil'; profiles?: { name: string; avatar_url: string | null } }
export const CATEGORIES = ['Dompet & Tas', 'Elektronik', 'Aksesoris', 'Dokumen & Kartu', 'Pakaian', 'Alat Tulis', 'Lainnya']
export const fmtDate = (s: string) => new Date(s).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) + ' WIB'
export const shortDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
export const timeWib = (s: string) => new Date(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.') + ' WIB'
export async function uploadPhoto(uid: string, file: File, prefix: string) {
  const path = `${uid}/${prefix}-${Date.now()}-${file.name.replace(/[^\w.]/g, '_')}`
  const { error } = await supabase.storage.from('photos').upload(path, file)
  if (error) throw error
  return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
}
