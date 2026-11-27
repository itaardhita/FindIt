import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, MapPin } from 'lucide-react'
import { supabase, Post, shortDate } from '../lib/supabase'
import { useApp } from '../lib/ctx'
import { ROOMS } from '../data/campus'
import CampusMap from '../components/CampusMap'
import { PageTitle } from '../components/ui'

export default function MapPage() {
  const { blocked } = useApp()
  const [floor, setFloor] = useState(1); const [room, setRoom] = useState<string | undefined>(); const [posts, setPosts] = useState<Post[]>([])
  useEffect(() => { supabase.from('posts').select('*').eq('status', 'belum_diambil').then(({ data }) => setPosts(((data as Post[]) ?? []).filter(p => !blocked.has(p.user_id)))) }, [blocked])
  const pins = useMemo(() => { const m: Record<string, number> = {}; posts.forEach(p => { const k = `${p.floor}:${p.room_id}`; m[k] = (m[k] ?? 0) + 1 }); return m }, [posts])
  const rooms = ROOMS.filter(r => r.floor === floor && !r.stairs)
  const inRoom = posts.filter(p => p.floor === floor && p.room_id === room)
  return (
    <div>
      <PageTitle title="Campus Map" sub="Temukan lokasi barang di area Tel-U Jakarta Halimun." />
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <CampusMap floor={floor} onFloor={n => { setFloor(n); setRoom(undefined) }} highlight={room} pins={pins} selectedItemCount={inRoom.length} height="h-[30rem]" onPick={(_f, r) => setRoom(r)} />
        <aside className="card p-5">
          <h2 className="text-lg font-extrabold">Area kampus</h2><p className="mb-3 text-sm text-ink/60">Pilih area untuk melihat daftar barang.</p>
          <ul className="max-h-80 overflow-y-auto">
            {rooms.map(r => <li key={r.id}><button onClick={() => setRoom(r.id)} className={`flex w-full items-center gap-3 border-b border-ink/5 px-1 py-2.5 text-left text-sm hover:text-tel ${room === r.id ? 'font-bold text-tel' : ''}`}><MapPin size={16} className="shrink-0 text-ink/40" /><span className="grow">{r.name}</span>{pins[`${floor}:${r.id}`] ? <span className="rounded-full bg-tel px-2 text-xs font-bold text-white">{pins[`${floor}:${r.id}`]}</span> : <ChevronRight size={15} className="text-ink/30" />}</button></li>)}
          </ul>
          <h3 className="mt-5 font-bold">Legenda</h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink/70"><span className="h-3 w-3 rounded-full bg-sky-500" />Area ruangan</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink/70"><span className="h-3 w-3 rounded-full bg-tel" />Titik penemuan barang</p>
        </aside>
      </div>
      {room && <section className="mt-6"><h2 className="mb-3 text-lg font-extrabold">Barang di area ini</h2>
        {inRoom.length === 0 ? <p className="card p-6 text-sm text-ink/60">Belum ada barang yang dilaporkan di sini.</p> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{inRoom.map(p => (
          <Link key={p.id} to={`/post/${p.id}`} state={{ sidebarFrom: '/map' }} className="card flex gap-3 p-3 hover:border-tel/40"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink/5">{p.photos[0] && <img src={p.photos[0]} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0"><b className="block truncate">{p.title}</b><span className="text-xs text-ink/60">{shortDate(p.found_at)}</span></div></Link>))}</div>}</section>}
    </div>
  )
}
