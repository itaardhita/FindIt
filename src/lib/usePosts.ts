import { useEffect, useState } from 'react'
import { supabase, Post } from './supabase'
import { useApp } from './ctx'

export type Filters = { q?: string; cat?: string; floor?: string; date?: string; sort?: 'asc' | 'desc'; limit?: number }
// Mengambil postingan belum diambil; ikut refresh otomatis (Realtime) saat ada perubahan status.
export function usePosts(o: Filters) {
  const { blocked } = useApp()
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const ch = supabase.channel('posts-live-' + Math.random().toString(36).slice(2)).on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => setTick(t => t + 1)).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])
  const key = JSON.stringify(o)
  useEffect(() => {
    const t = setTimeout(async () => {
      let query = supabase.from('posts').select('*, profiles!posts_user_id_fkey(name, avatar_url)').eq('status', 'belum_diambil').order('found_at', { ascending: o.sort === 'asc' })
      const q = o.q?.replace(/[,()%]/g, ' ').trim()
      if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,location_note.ilike.%${q}%`)
      if (o.cat) query = query.eq('category', o.cat)
      if (o.floor) query = query.eq('floor', +o.floor)
      if (o.date) query = query.gte('found_at', `${o.date}T00:00:00`).lte('found_at', `${o.date}T23:59:59`)
      if (o.limit) query = query.limit(o.limit)
      const { data } = await query
      setPosts((data as Post[]) ?? [])
    }, 250)
    return () => clearTimeout(t)
  }, [key, tick])
  return posts ? posts.filter(p => !blocked.has(p.user_id)) : null
}
