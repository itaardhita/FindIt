import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, X } from 'lucide-react'
import { supabase, CATEGORIES, Post, uploadPhoto } from '../lib/supabase'
import { useApp } from '../lib/ctx'
import CampusMap from '../components/CampusMap'
import { getRoom, ROOMS } from '../data/campus'
import { PageTitle } from '../components/ui'

const toLocal = (d: Date) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16) }

export default function NewPost() {
  const { uid } = useApp(); const nav = useNavigate(); const { id } = useParams()
  const [f, setF] = useState({ title: '', description: '', category: CATEGORIES[0], found_at: toLocal(new Date()), floor: 1, room_id: '', note: '' })
  const [old, setOld] = useState<string[]>([]); const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('')
  const previews = useMemo(() => files.map(x => URL.createObjectURL(x)), [files])
  useEffect(() => {
    if (!id) return
    supabase.from('posts').select('*').eq('id', id).single().then(({ data }) => {
      const p = data as Post | null; if (!p || p.user_id !== uid) return nav('/')
      setF({ title: p.title, description: p.description, category: p.category, found_at: toLocal(new Date(p.found_at)), floor: p.floor, room_id: p.room_id, note: p.location_note ?? '' }); setOld(p.photos)
    })
  }, [id])
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!f.room_id) return setErr('Pilih lokasi ruangan di denah atau daftar.')
    setBusy(true); setErr('')
    try {
      const photos = [...old]; for (const [i, file] of files.entries()) photos.push(await uploadPhoto(uid, file, `p${i}`))
      const row = { title: f.title, description: f.description, category: f.category, photos, found_at: new Date(f.found_at).toISOString(), floor: f.floor, room_id: f.room_id, location_note: f.note || null }
      const { data, error } = id ? await supabase.from('posts').update(row).eq('id', id).select('id').single() : await supabase.from('posts').insert({ ...row, user_id: uid }).select('id').single()
      if (error) throw error
      nav(`/post/${data.id}`)
    } catch (x) { setErr((x as Error).message); setBusy(false) }
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5">
      <PageTitle title={id ? 'Edit postingan' : 'Post barang'} sub="Isi detail barang yang kamu temukan." />
      <input className="inp" required placeholder="Nama barang, mis. Dompet kuning" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
      <textarea className="inp" rows={3} placeholder="Ciri-ciri, mis. kecil, ada resleting" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="inp" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        <input className="inp" type="datetime-local" required value={f.found_at} onChange={e => setF({ ...f, found_at: e.target.value })} aria-label="Waktu ditemukan" />
      </div>
      <div>
        <p className="mb-2 text-sm font-bold">Foto barang</p>
        <div className="flex flex-wrap gap-2">
          {old.map(s => <div key={s} className="relative"><img src={s} alt="" className="h-24 w-24 rounded-xl object-cover" /><button type="button" aria-label="Hapus foto" onClick={() => setOld(old.filter(x => x !== s))} className="absolute -right-2 -top-2 rounded-full bg-tel p-1 text-white"><X size={12} /></button></div>)}
          {previews.map((s, i) => <div key={s} className="relative"><img src={s} alt="Pratinjau" className="h-24 w-24 rounded-xl object-cover" /><button type="button" aria-label="Hapus foto" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-tel p-1 text-white"><X size={12} /></button></div>)}
          <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-ink/20 text-ink/50 hover:border-tel hover:text-tel"><ImagePlus /><input type="file" accept="image/*" multiple hidden onChange={e => setFiles([...files, ...Array.from(e.target.files ?? [])].slice(0, 5))} /></label>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-bold">Lokasi ditemukan</p>
        <CampusMap floor={f.floor} highlight={f.room_id} onPick={(floor, room) => setF({ ...f, floor, room_id: room })} />
        <p className="text-sm">{f.room_id ? <>Terpilih: <b>{getRoom(f.floor, f.room_id)?.name}</b>, Lantai {f.floor}</> : <span className="text-ink/60">Belum ada ruangan dipilih.</span>}</p>
        <select className="inp" value={f.room_id ? `${f.floor}:${f.room_id}` : ''} onChange={e => { const [fl, r] = e.target.value.split(':'); setF({ ...f, floor: +fl, room_id: r }) }}>
          <option value="">Atau pilih dari daftar…</option>
          {ROOMS.filter(r => !r.stairs).map(r => <option key={r.floor + r.id} value={`${r.floor}:${r.id}`}>Lantai {r.floor} – {r.name}</option>)}
        </select>
        <input className="inp" placeholder="Detail lokasi (opsional), mis. dekat ruang B204" value={f.note} onChange={e => setF({ ...f, note: e.target.value })} />
      </div>
      {err && <p className="text-sm text-tel" role="alert">{err}</p>}
      <button className="btn w-full !py-3" disabled={busy}>{busy ? 'Menyimpan…' : id ? 'Simpan perubahan' : 'Publikasikan'}</button>
    </form>
  )
}
