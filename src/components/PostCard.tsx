import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bookmark, MapPin } from 'lucide-react'
import { Post, shortDate, timeWib } from '../lib/supabase'
import { getRoom } from '../data/campus'
import { useApp } from '../lib/ctx'
import { Avatar } from './ui'

export default function PostCard({ p, actions }: { p: Post; actions?: ReactNode }) {
  const { pathname } = useLocation()
  const { saved, toggleSave, uid } = useApp()
  const on = saved.has(p.id), room = getRoom(p.floor, p.room_id)
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:border-tel/40 hover:shadow-lg">
      <Link to={`/post/${p.id}`} state={{ sidebarFrom: pathname }} className="relative block aspect-[4/3] overflow-hidden bg-ink/5">
        {p.photos[0] ? <img src={p.photos[0]} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="grid h-full place-items-center text-sm text-ink/40">Tanpa foto</div>}
        <span className={`absolute left-3 top-3 rounded-lg px-3 py-1 text-xs font-bold shadow ${p.status === 'belum_diambil' ? 'bg-surface text-tel' : 'bg-green-600 text-white'}`}>{p.status === 'belum_diambil' ? 'Belum diambil' : 'Sudah diambil'}</span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between text-xs text-ink/60"><span className="rounded-lg bg-ink/5 px-2.5 py-1 font-semibold">{p.category}</span><span>{shortDate(p.found_at)}</span></div>
        <Link to={`/post/${p.id}`} state={{ sidebarFrom: pathname }} className="mt-3 text-lg font-bold leading-snug hover:text-tel">{p.title}</Link>
        <p className="mt-1 line-clamp-2 text-sm text-ink/60">{p.description}</p>
        <p className="my-3 flex items-center gap-1.5 text-sm"><MapPin size={15} className="shrink-0 text-tel" /><b className="truncate text-tel">{room?.name ?? `Lantai ${p.floor}`}</b><span className="shrink-0 text-ink/50">· Lantai {p.floor}</span></p>
        <div className="mt-auto flex items-center gap-2.5 border-t border-ink/10 pt-3">
          <Avatar name={p.profiles?.name} url={p.profiles?.avatar_url} size={34} />
          <div className="min-w-0 grow"><p className="truncate text-sm font-bold">{p.profiles?.name}</p><p className="text-xs text-ink/50">{timeWib(p.found_at)}</p></div>
          {actions ?? (p.user_id !== uid && <button aria-label={on ? 'Hapus dari tersimpan' : 'Simpan'} aria-pressed={on} onClick={() => toggleSave(p.id)} className={`rounded-lg p-2 transition hover:bg-ink/5 ${on ? 'text-tel' : 'text-ink/50'}`}><Bookmark size={18} fill={on ? 'currentColor' : 'none'} /></button>)}
        </div>
      </div>
    </article>
  )
}
