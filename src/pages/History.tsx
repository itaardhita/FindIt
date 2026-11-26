import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { supabase, shortDate } from '../lib/supabase'
import { useApp } from '../lib/ctx'
import { Avatar, PageTitle, Skeleton } from '../components/ui'

type H = { id: string; closed_at: string; finder_id: string; posts: { id: string; title: string; photos: string[] }; finder: { name: string; avatar_url: string | null }; claimer: { name: string; avatar_url: string | null } }
export default function History() {
  const { uid } = useApp(); const [list, setList] = useState<H[] | null>(null)
  useEffect(() => {
    supabase.from('conversations').select('id, closed_at, finder_id, posts(id, title, photos), finder:profiles!conversations_finder_id_fkey(name, avatar_url), claimer:profiles!conversations_claimer_id_fkey(name, avatar_url), status').eq('status', 'closed').order('closed_at', { ascending: false })
      .then(({ data }) => { const seen = new Set<string>(); setList(((data ?? []) as unknown as H[]).filter(h => !seen.has(h.posts.id) && seen.add(h.posts.id))) })
  }, [])
  return (
    <div>
      <PageTitle title="History" sub="Barang yang sudah berhasil dikembalikan ke pemiliknya." />
      {list === null ? <Skeleton className="h-40" /> : list.length === 0 ? <p className="card p-10 text-center text-ink/60">Belum ada serah terima yang selesai. Riwayat muncul di sini setelah QR dipindai.</p> : (
        <div className="grid gap-4 md:grid-cols-2">{list.map(h => { const fin = h.finder_id === uid, o = fin ? h.claimer : h.finder; return (
          <Link key={h.id} to={`/post/${h.posts.id}`} className="card flex items-center gap-4 p-4 hover:border-tel/40">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink/5">{h.posts.photos[0] && <img src={h.posts.photos[0]} alt="" className="h-full w-full object-cover" />}</div>
            <div className="min-w-0 grow"><b className="block truncate text-lg">{h.posts.title}</b>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-green-600"><CheckCircle2 size={15} />{fin ? 'Kamu menyerahkan' : 'Kamu menerima'}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-ink/60"><Avatar name={o.name} url={o.avatar_url} size={20} />{o.name} · {shortDate(h.closed_at)}</p></div>
          </Link>) })}</div>)}
    </div>
  )
}
