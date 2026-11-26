import { Link } from 'react-router-dom'
import { Post, fmtDate } from '../lib/supabase'
import { roomLabel } from '../data/campus'

export default function PostCard({ p }: { p: Post }) {
  return (
    <Link to={`/post/${p.id}`} className="group flex gap-3 rounded-2xl border border-ink/10 bg-white p-3 transition hover:border-tel/40 hover:shadow-md sm:flex-col">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink/5 sm:h-44 sm:w-full">
        {p.photos[0] ? <img src={p.photos[0]} alt={p.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="grid h-full place-items-center text-xs text-ink/40">Tanpa foto</div>}
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-bold">{p.title}</h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${p.status === 'belum_diambil' ? 'bg-sun/30 text-ink' : 'bg-green-100 text-green-800'}`}>{p.status === 'belum_diambil' ? 'Belum diambil' : 'Sudah diambil'}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-ink/70">{p.description}</p>
        <p className="mt-2 text-xs text-ink/60">{roomLabel(p.floor, p.room_id)}</p>
        <p className="text-xs text-ink/50">{fmtDate(p.found_at)}</p>
      </div>
    </Link>
  )
}
