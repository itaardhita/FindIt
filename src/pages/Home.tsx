import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronRight, PackageSearch, Sparkles, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/ctx'
import { usePosts } from '../lib/usePosts'
import PostCard from '../components/PostCard'
import { Skeleton } from '../components/ui'

export default function Home() {
  const { me } = useApp(); const posts = usePosts({ limit: 6 })
  const [s, setS] = useState({ found: 0, returned: 0, users: 0 })
  useEffect(() => {
    const c = (t: string, st?: string) => { let q = supabase.from(t).select('*', { count: 'exact', head: true }); if (st) q = q.eq('status', st); return q.then(r => r.count ?? 0) }
    Promise.all([c('posts', 'belum_diambil'), c('posts', 'sudah_diambil'), c('profiles')]).then(([found, returned, users]) => setS({ found, returned, users }))
  }, [posts?.length])
  const stat = [{ n: s.found, l: 'Barang ditemukan', I: PackageSearch, c: 'bg-tel-soft text-tel' }, { n: s.returned, l: 'Berhasil dikembalikan', I: CheckCircle2, c: 'bg-green-500/15 text-green-600' }, { n: s.users, l: 'Mahasiswa bergabung', I: User, c: 'bg-sky-500/15 text-sky-600' }]
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-tel-soft p-8 sm:p-10">
        <p className="flex items-center gap-2 text-sm font-bold tracking-wide text-tel"><Sparkles size={16} />CAMPUS COMMUNITY</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Hai{me ? `, ${me.name.split(' ')[0]}` : ''}.<br /><span className="text-tel">Temukan kembali yang hilang.</span></h1>
        <p className="mt-3 max-w-md text-ink/60">Barang yang ditemukan teman kampus, mungkin sedang kamu cari.</p>
        <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 md:block">
          <span className="grid h-44 w-44 place-items-center rounded-full bg-tel/10 text-tel"><PackageSearch size={84} strokeWidth={1.5} /></span>
          <span className="absolute -bottom-2 -left-6 -rotate-6 rounded-xl bg-surface px-4 py-2 text-sm font-bold shadow-lg">Lost? Let's FindIt!</span>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {stat.map(({ n, l, I, c }) => (<div key={l} className="card flex items-center gap-4 p-5"><span className={`grid h-14 w-14 place-items-center rounded-2xl ${c}`}><I size={26} /></span><div><p className="text-3xl font-extrabold leading-none">{n}</p><p className="mt-1 text-sm text-ink/60">{l}</p></div></div>))}
      </section>
      <section>
        <div className="mb-5 flex items-end justify-between gap-3">
          <div><h2 className="text-2xl font-extrabold">Barang ditemukan</h2><p className="text-ink/60">Yuk, bantu barang-barang ini kembali ke pemiliknya.</p></div>
          <Link to="/explore" className="btn-ghost shrink-0">Lihat semua<ChevronRight size={16} /></Link>
        </div>
        {posts === null ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-80" />)}</div>
          : posts.length === 0 ? <p className="card p-10 text-center text-ink/60">Belum ada barang yang dilaporkan. Jadilah yang pertama lewat tombol “Post barang”.</p>
          : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{posts.map(p => <PostCard key={p.id} p={p} />)}</div>}
      </section>
    </div>
  )
}
