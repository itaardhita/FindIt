import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Ban, Bookmark, Calendar, ChevronLeft, Flag, Map as MapIcon, MapPin, MessageCircle, Pencil, Tag, Trash2 } from 'lucide-react'
import { supabase, Post, fmtDate } from '../lib/supabase'
import { useApp } from '../lib/ctx'
import { getRoom } from '../data/campus'
import CampusMap from '../components/CampusMap'
import ReportModal from '../components/ReportModal'
import { Avatar, Skeleton } from '../components/ui'

export default function PostDetail() {
  const { uid, saved, toggleSave, blocked, toggleBlock } = useApp()
  const { id } = useParams(); const nav = useNavigate()
  const [p, setP] = useState<Post | null>(null); const [map, setMap] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [img, setImg] = useState(0); const [report, setReport] = useState(false)
useEffect(() => {
  supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(name, avatar_url)')
    .eq('id', id)
    .single()
    .then(({ data, error }) => {
      if (error) {
        console.error('Error mengambil detail postingan:', error)
        return
      }
      setP(data as Post)
    })
}, [id])
  if (!p) return <Skeleton className="h-96" />
  const mine = p.user_id === uid, open = p.status === 'belum_diambil', on = saved.has(p.id), isBlocked = blocked.has(p.user_id)
  async function claim() {
    setBusy(true); setErr('')
    const { data: ex } = await supabase.from('conversations').select('id').eq('post_id', p!.id).eq('claimer_id', uid).maybeSingle()
    let cid = ex?.id as string | undefined
    if (!cid) {
      const { data, error } = await supabase.from('conversations').insert({ post_id: p!.id, finder_id: p!.user_id, claimer_id: uid }).select('id').single()
      if (error) { setErr('Kamu tidak bisa menghubungi pengguna ini.'); setBusy(false); return }
      cid = data.id
      await supabase.from('messages').insert({ conversation_id: cid, sender_id: uid, body: `Halo, saya merasa "${p!.title}" ini barang saya. Boleh saya verifikasi?` })
    }
    nav(`/messages/${cid}`)
  }
  async function remove() { if (confirm('Hapus postingan ini?')) { await supabase.from('posts').delete().eq('id', p!.id); nav('/') } }
  const room = getRoom(p.floor, p.room_id)
  const row = (I: typeof Tag, k: string, v: string) => <div className="flex items-start gap-3"><I size={18} className="mt-0.5 shrink-0 text-tel" /><div><p className="text-xs text-ink/50">{k}</p><p className="font-semibold">{v}</p></div></div>
  return (
    <div>
  <button
  type="button"
  onClick={() => {
    if (window.history.state?.idx > 0) {
      nav(-1)
    } else {
      nav('/explore', { replace: true })
    }
  }}
  className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-ink/60 hover:text-tel"
>
  <ChevronLeft size={16} />
  Kembali
</button>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl bg-ink/5">{p.photos[img] ? <img src={p.photos[img]} alt={p.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-ink/40">Tanpa foto</div>}</div>
          {p.photos.length > 1 && <div className="mt-3 flex gap-2">{p.photos.map((s, i) => <button key={s} onClick={() => setImg(i)} aria-label={`Foto ${i + 1}`}><img src={s} alt="" className={`h-16 w-16 rounded-xl object-cover ${i === img ? 'ring-2 ring-tel' : 'opacity-70'}`} /></button>)}</div>}
        </div>
        <div className="space-y-5">
          <div>
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${open ? 'bg-tel-soft text-tel' : 'bg-green-600 text-white'}`}>{open ? 'Belum diambil' : 'Sudah diambil'}</span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{p.title}</h1>
            <p className="mt-2 text-ink/70">{p.description}</p>
          </div>
          <div className="card space-y-4 p-5">
            {row(Tag, 'Kategori', p.category)}{row(Calendar, 'Ditemukan', fmtDate(p.found_at))}{row(MapPin, 'Lokasi', `Lantai ${p.floor}, ${room?.name ?? ''}${p.location_note ? ` (${p.location_note})` : ''}`)}
            <div className="flex items-center gap-3 border-t border-ink/10 pt-4"><Avatar name={p.profiles?.name} url={p.profiles?.avatar_url} size={40} /><div><p className="text-xs text-ink/50">Penemu</p><p className="font-bold">{p.profiles?.name}</p></div></div>
          </div>
          <button className="btn-ghost w-full" onClick={() => setMap(!map)}><MapIcon size={17} />{map ? 'Tutup denah' : 'Lihat lokasi di denah'}</button>
          {map && <CampusMap floor={p.floor} highlight={p.room_id} />}
          {open && !mine && <button className="btn w-full !py-3" onClick={claim} disabled={busy || isBlocked}><MessageCircle size={18} />{isBlocked ? 'Pengguna diblokir' : 'Ini barang saya'}</button>}
          {err && <p className="text-sm text-tel">{err}</p>}
          <div className="flex flex-wrap gap-2">
            {!mine && <>
              <button className="btn-ghost !py-2" onClick={() => toggleSave(p.id)}><Bookmark size={16} fill={on ? 'currentColor' : 'none'} />{on ? 'Tersimpan' : 'Simpan'}</button>
              <button className="btn-ghost !py-2" onClick={() => setReport(true)}><Flag size={16} />Laporkan</button>
              <button className="btn-ghost !py-2" onClick={() => confirm(isBlocked ? 'Buka blokir pengguna ini?' : 'Blokir pengguna ini? Postingannya tidak akan tampil lagi.') && toggleBlock(p.user_id)}><Ban size={16} />{isBlocked ? 'Buka blokir' : 'Blokir'}</button>
            </>}
            {mine && open && <><Link to={`/post/${p.id}/edit`} className="btn-ghost !py-2"><Pencil size={16} />Edit</Link><button className="btn-ghost !py-2 !text-tel" onClick={remove}><Trash2 size={16} />Hapus</button></>}
          </div>
        </div>
      </div>
      {report && <ReportModal postId={p.id} onClose={() => setReport(false)} />}
    </div>
  )
}
