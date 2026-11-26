import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownUp } from 'lucide-react'
import { CATEGORIES } from '../lib/supabase'
import { usePosts } from '../lib/usePosts'
import PostCard from '../components/PostCard'
import { PageTitle, Skeleton } from '../components/ui'

export default function Explore() {
  const [sp, setSp] = useSearchParams(); const q = sp.get('q') ?? ''
  const [cat, setCat] = useState(''); const [floor, setFloor] = useState(''); const [date, setDate] = useState(''); const [sort, setSort] = useState<'asc' | 'desc'>('desc')
  const posts = usePosts({ q, cat, floor, date, sort })
  return (
    <div>
      <PageTitle title="Explore" sub="Cari barang yang belum diambil, lalu hubungi penemunya untuk verifikasi." />
      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input className="inp lg:col-span-2" placeholder="Cari, mis. dompet kuning" value={q} onChange={e => setSp(e.target.value ? { q: e.target.value } : {})} />
        <select className="inp" value={cat} onChange={e => setCat(e.target.value)}><option value="">Semua kategori</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        <select className="inp" value={floor} onChange={e => setFloor(e.target.value)}><option value="">Semua lantai</option>{[1, 2, 3, 4].map(n => <option key={n} value={n}>Lantai {n}</option>)}</select>
        <input className="inp" type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Tanggal ditemukan" />
      </div>
      <button className="btn-ghost mb-5 !py-2" onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}><ArrowDownUp size={15} />{sort === 'desc' ? 'Terbaru dulu' : 'Terlama dulu'}</button>
      {posts === null ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-80" />)}</div>
        : posts.length === 0 ? <p className="card p-10 text-center text-ink/60">Tidak ada barang yang cocok. Coba kata kunci lain, atau reset filter.</p>
        : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{posts.map(p => <PostCard key={p.id} p={p} />)}</div>}
    </div>
  )
}
