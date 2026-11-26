import { useEffect, useState } from 'react'
import { supabase, Post, fmtDate } from '../lib/supabase'
import PostCard from '../components/PostCard'

export default function Profile({ uid }: { uid: string }) {
  const [name, setName] = useState(''); const [mine, setMine] = useState<Post[]>([]); const [hist, setHist] = useState<Post[]>([]); const [saved, setSaved] = useState(false)
  useEffect(() => {
    supabase.from('profiles').select('name').eq('id', uid).single().then(({ data }) => setName(data?.name ?? ''))
    supabase.from('posts').select('*').eq('user_id', uid).order('created_at', { ascending: false }).then(({ data }) => setMine((data as Post[]) ?? []))
    supabase.from('conversations').select('posts(*)').eq('status', 'closed').then(({ data }) => setHist(((data ?? []) as unknown as { posts: Post }[]).map(r => r.posts)))
  }, [uid])
  async function save() { await supabase.from('profiles').update({ name }).eq('id', uid); setSaved(true) }
  const active = mine.filter(p => p.status === 'belum_diambil')
  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end gap-2">
        <div className="grow"><label className="text-sm font-bold">Nama tampilan</label><input className="inp" value={name} onChange={e => { setName(e.target.value); setSaved(false) }} /></div>
        <button className="btn" onClick={save}>{saved ? 'Tersimpan' : 'Simpan'}</button>
        <button className="btn-ghost" onClick={() => supabase.auth.signOut()}>Keluar</button>
      </section>
      <section><h2 className="mb-3 text-lg font-extrabold">Postingan saya yang masih aktif</h2>
        {active.length ? <div className="grid gap-3 sm:grid-cols-3">{active.map(p => <PostCard key={p.id} p={p} />)}</div> : <p className="text-ink/60">Tidak ada.</p>}</section>
      <section><h2 className="mb-3 text-lg font-extrabold">Riwayat barang dikembalikan</h2>
        {hist.length ? <ul className="space-y-2">{hist.map(p => <li key={p.id} className="rounded-xl bg-white p-3 text-sm"><b>{p.title}</b> · diserahkan, ditemukan {fmtDate(p.found_at)}</li>)}</ul> : <p className="text-ink/60">Belum ada serah terima yang selesai.</p>}</section>
    </div>
  )
}
