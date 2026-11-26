import { useEffect, useState } from 'react'
import { supabase, Post, CATEGORIES } from '../lib/supabase'
import PostCard from '../components/PostCard'

export default function Feed() {
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [q, setQ] = useState(''); const [cat, setCat] = useState(''); const [floor, setFloor] = useState(''); const [date, setDate] = useState('')
  const [sort, setSort] = useState<'desc' | 'asc'>('desc')
  useEffect(() => {
    const t = setTimeout(async () => {
      setPosts(null)
      let query = supabase.from('posts').select('*, profiles(name)').eq('status', 'belum_diambil').order('found_at', { ascending: sort === 'asc' })
      if (q.trim()) query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`)
      if (cat) query = query.eq('category', cat)
      if (floor) query = query.eq('floor', +floor)
      if (date) query = query.gte('found_at', `${date}T00:00:00`).lte('found_at', `${date}T23:59:59`)
      const { data } = await query
      setPosts((data as Post[]) ?? [])
    }, 250)
    return () => clearTimeout(t)
  }, [q, cat, floor, date, sort])
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Barang yang belum diambil</h1>
        <p className="text-sm text-ink/70">Temukan barangmu, lalu hubungi penemunya untuk verifikasi.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-5">
        <input className="inp sm:col-span-2" placeholder="Cari, mis. dompet kuning" value={q} onChange={e => setQ(e.target.value)} />
        <select className="inp" value={cat} onChange={e => setCat(e.target.value)}><option value="">Semua kategori</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        <select className="inp" value={floor} onChange={e => setFloor(e.target.value)}><option value="">Semua lantai</option>{[1, 2, 3, 4].map(n => <option key={n} value={n}>Lantai {n}</option>)}</select>
        <input className="inp" type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Tanggal ditemukan" />
      </div>
      <button className="text-sm font-bold underline" onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}>Urutkan: {sort === 'desc' ? 'terbaru' : 'terlama'}</button>
      {posts === null ? (
        <div className="grid gap-3 sm:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="h-56 animate-pulse rounded-2xl bg-ink/5" />)}</div>
      ) : posts.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-ink/70">Belum ada barang yang cocok. Coba kata kunci lain, atau lapor jika kamu menemukan barang.</p>
      ) : <div className="grid gap-3 sm:grid-cols-3">{posts.map(p => <PostCard key={p.id} p={p} />)}</div>}
    </div>
  )
}
