import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, CATEGORIES } from '../lib/supabase'
import CampusMap from '../components/CampusMap'
import { getRoom, ROOMS } from '../data/campus'

const nowLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }

export default function NewPost({ uid }: { uid: string }) {
  const nav = useNavigate()
  const [f, setF] = useState({ title: '', description: '', category: CATEGORIES[0], found_at: nowLocal(), floor: 1, room_id: '', note: '' })
  const [files, setFiles] = useState<File[]>([]); const [busy, setBusy] = useState(false); const [err, setErr] = useState('')
  const previews = files.map(x => URL.createObjectURL(x))
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!f.room_id) return setErr('Pilih lokasi ruangan di denah atau daftar.')
    setBusy(true); setErr('')
    const photos: string[] = []
    for (const [i, file] of files.entries()) {
      const path = `${uid}/${Date.now()}-${i}-${file.name.replace(/[^\w.]/g, '_')}`
      const { error } = await supabase.storage.from('photos').upload(path, file)
      if (error) { setErr(error.message); setBusy(false); return }
      photos.push(supabase.storage.from('photos').getPublicUrl(path).data.publicUrl)
    }
    const { data, error } = await supabase.from('posts').insert({ user_id: uid, title: f.title, description: f.description, category: f.category, photos, found_at: new Date(f.found_at).toISOString(), floor: f.floor, room_id: f.room_id, location_note: f.note || null }).select('id').single()
    if (error) { setErr(error.message); setBusy(false) } else nav(`/post/${data.id}`)
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-extrabold">Lapor barang temuan</h1>
      <input className="inp" required placeholder="Nama barang, mis. Dompet kuning" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
      <textarea className="inp" rows={3} placeholder="Ciri-ciri, mis. kecil, ada resleting" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="inp" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        <input className="inp" type="datetime-local" required value={f.found_at} onChange={e => setF({ ...f, found_at: e.target.value })} aria-label="Waktu ditemukan" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold">Foto barang (bisa lebih dari satu)</label>
        <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files ?? []).slice(0, 5))} />
        <div className="mt-2 flex gap-2">{previews.map(s => <img key={s} src={s} alt="Pratinjau" className="h-20 w-20 rounded-lg object-cover" />)}</div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-bold">Lokasi ditemukan</label>
        <CampusMap floor={f.floor} highlight={f.room_id} onPick={(floor, room) => setF({ ...f, floor, room_id: room })} />
        <p className="text-sm">{f.room_id ? <>Terpilih: <b>{getRoom(f.floor, f.room_id)?.name}</b>, Lantai {f.floor}</> : <span className="text-ink/60">Belum ada ruangan dipilih.</span>}</p>
        <select className="inp" value={`${f.floor}:${f.room_id}`} onChange={e => { const [fl, r] = e.target.value.split(':'); setF({ ...f, floor: +fl, room_id: r }) }}>
          <option value="1:">Atau pilih dari daftar…</option>
          {ROOMS.filter(r => !r.stairs).map(r => <option key={r.floor + r.id} value={`${r.floor}:${r.id}`}>Lantai {r.floor} – {r.name}</option>)}
        </select>
        <input className="inp" placeholder="Detail lokasi (opsional), mis. dekat ruang B204" value={f.note} onChange={e => setF({ ...f, note: e.target.value })} />
      </div>
      {err && <p className="text-sm text-tel" role="alert">{err}</p>}
      <button className="btn w-full" disabled={busy}>{busy ? 'Mengunggah…' : 'Publikasikan'}</button>
    </form>
  )
}
