import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase, Post, fmtDate } from '../lib/supabase'
import { getRoom } from '../data/campus'
import CampusMap from '../components/CampusMap'

export default function PostDetail({ uid }: { uid: string }) {
  const { id } = useParams(); const nav = useNavigate()
  const [p, setP] = useState<Post | null>(null); const [map, setMap] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState('')
  const [img, setImg] = useState(0)
  useEffect(() => { supabase.from('posts').select('*, profiles(name)').eq('id', id).single().then(({ data }) => setP(data as Post)) }, [id])
  if (!p) return <div className="h-64 animate-pulse rounded-2xl bg-ink/5" />
  const mine = p.user_id === uid
  async function claim() {
    setBusy(true); setErr('')
    const { data: ex } = await supabase.from('conversations').select('id').eq('post_id', p!.id).eq('claimer_id', uid).maybeSingle()
    let cid = ex?.id as string | undefined
    if (!cid) {
      const { data, error } = await supabase.from('conversations').insert({ post_id: p!.id, finder_id: p!.user_id, claimer_id: uid }).select('id').single()
      if (error) { setErr(error.message); setBusy(false); return }
      cid = data.id
      await supabase.from('messages').insert({ conversation_id: cid, sender_id: uid, body: `Halo, saya merasa "${p!.title}" ini barang saya. Boleh saya verifikasi?` })
    }
    nav(`/chat/${cid}`)
  }
  async function remove() { if (confirm('Hapus postingan ini?')) { await supabase.from('posts').delete().eq('id', p!.id); nav('/') } }
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <div className="aspect-square overflow-hidden rounded-2xl bg-ink/5">{p.photos[img] && <img src={p.photos[img]} alt={p.title} className="h-full w-full object-cover" />}</div>
        <div className="mt-2 flex gap-2">{p.photos.map((s, i) => <button key={s} onClick={() => setImg(i)}><img src={s} alt="" className={`h-14 w-14 rounded-lg object-cover ${i === img ? 'ring-2 ring-tel' : ''}`} /></button>)}</div>
      </div>
      <div className="space-y-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.status === 'belum_diambil' ? 'bg-sun/30' : 'bg-green-100 text-green-800'}`}>{p.status === 'belum_diambil' ? 'Belum diambil' : 'Sudah diambil'}</span>
        <h1 className="text-2xl font-extrabold">{p.title}</h1>
        <p>{p.description}</p>
        <dl className="space-y-1 text-sm">
          <div><dt className="inline font-bold">Kategori: </dt><dd className="inline">{p.category}</dd></div>
          <div><dt className="inline font-bold">Ditemukan: </dt><dd className="inline">{fmtDate(p.found_at)}</dd></div>
          <div><dt className="inline font-bold">Lokasi: </dt><dd className="inline">Lantai {p.floor}, {getRoom(p.floor, p.room_id)?.name}{p.location_note && ` (${p.location_note})`}</dd></div>
          <div><dt className="inline font-bold">Penemu: </dt><dd className="inline">{p.profiles?.name}</dd></div>
        </dl>
        <button className="btn-ghost" onClick={() => setMap(!map)}>{map ? 'Tutup denah' : 'Lihat lokasi di denah'}</button>
        {map && <CampusMap floor={p.floor} highlight={p.room_id} />}
        {p.status === 'belum_diambil' && !mine && <button className="btn w-full" onClick={claim} disabled={busy}>Ini barang saya</button>}
        {mine && p.status === 'belum_diambil' && <button className="btn-ghost w-full" onClick={remove}>Hapus postingan</button>}
        {err && <p className="text-sm text-tel">{err}</p>}
      </div>
    </div>
  )
}
