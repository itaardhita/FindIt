import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { supabase, Post, uploadPhoto } from '../lib/supabase'
import { useApp } from '../lib/ctx'
import PostCard from '../components/PostCard'
import { Avatar, Modal, Skeleton } from '../components/ui'

export default function ProfilePage() {
  const { uid, me, reloadMe, saved, blocked, toggleBlock } = useApp()
  const [tab, setTab] = useState<'mine' | 'saved' | 'blocked'>('mine'); const [mine, setMine] = useState<Post[] | null>(null); const [sv, setSv] = useState<Post[] | null>(null); const [bl, setBl] = useState<{ blocked_id: string; blocked: { name: string; avatar_url: string | null } }[]>([])
  const [edit, setEdit] = useState(false); const [name, setName] = useState(''); const [file, setFile] = useState<File | null>(null); const [busy, setBusy] = useState(false)
  const loadMine = () => supabase
  .from('posts')
  .select('*, profiles!posts_user_id_fkey(name, avatar_url)')
  .eq('user_id', uid)
  .order('created_at', { ascending: false })
  .then(({ data, error }) => {
    if (error) console.error('Error loadMine:', error)
    setMine((data as Post[]) ?? [])
  })
  useEffect(() => { loadMine() }, [uid])
useEffect(() => {
  supabase
    .from('bookmarks')
    .select('*, posts(*, profiles!posts_user_id_fkey(name, avatar_url))')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.error('Error bookmarks:', error)
      }
      setSv(
        ((data ?? []) as unknown as { posts: Post }[])
          .map(r => r.posts)
          .filter(Boolean)
      )
    })
}, [saved, uid])
  useEffect(() => { supabase.from('blocks').select('blocked_id, blocked:profiles!blocks_blocked_id_fkey(name, avatar_url)').then(({ data }) => setBl((data ?? []) as never)) }, [blocked.size])
  async function save() {
    setBusy(true); const patch: { name: string; avatar_url?: string } = { name: name.trim() || me!.name }
    try { if (file) patch.avatar_url = await uploadPhoto(uid, file, 'avatar') } catch { /* tetap simpan nama */ }
    await supabase.from('profiles').update(patch).eq('id', uid); reloadMe(); setBusy(false); setEdit(false); setFile(null)
  }
  async function remove(id: string) { if (confirm('Hapus postingan ini?')) { await supabase.from('posts').delete().eq('id', id); loadMine() } }
  const tabs = [{ k: 'mine', l: 'Postingan saya' }, { k: 'saved', l: 'Tersimpan' }, { k: 'blocked', l: 'Diblokir' }] as const
  const grid = (l: Post[] | null, empty: string, mineCards = false) => l === null ? <Skeleton className="h-72" /> : l.length === 0 ? <p className="card p-10 text-center text-ink/60">{empty}</p> : (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{l.map(p => <PostCard key={p.id} p={p} actions={mineCards && p.status === 'belum_diambil' ? <div className="flex gap-1"><Link to={`/post/${p.id}/edit`} aria-label="Edit" className="rounded-lg p-2 hover:bg-ink/5"><Pencil size={17} /></Link><button aria-label="Hapus" onClick={() => remove(p.id)} className="rounded-lg p-2 text-tel hover:bg-ink/5"><Trash2 size={17} /></button></div> : mineCards ? <span /> : undefined} />)}</div>)
  return (
    <div className="space-y-6">
      <section className="card flex flex-wrap items-center gap-6 p-6">
        <Avatar name={me?.name} url={me?.avatar_url} size={96} />
        <div className="grow"><h1 className="text-3xl font-extrabold">{me?.name}</h1><p className="text-ink/60">Telkom University Jakarta · Member FindIt</p>
          <p className="mt-3 flex gap-5 text-sm"><span><b>{mine?.length ?? 0}</b> Post</span><span><b>{saved.size}</b> Saved</span><span><b>{mine?.filter(p => p.status === 'sudah_diambil').length ?? 0}</b> Returned</span></p></div>
        <button className="btn-ghost" onClick={() => { setName(me?.name ?? ''); setEdit(true) }}><Pencil size={16} />Edit profil</button>
      </section>
      <div role="tablist" className="flex gap-2">{tabs.map(t => <button key={t.k} role="tab" aria-selected={tab === t.k} onClick={() => setTab(t.k)} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === t.k ? 'bg-tel text-white' : 'bg-ink/5 text-ink/70 hover:bg-ink/10'}`}>{t.l}</button>)}</div>
      {tab === 'mine' && grid(mine, 'Kamu belum memposting barang. Tekan “Post barang” untuk mulai.', true)}
      {tab === 'saved' && grid(sv, 'Belum ada postingan tersimpan. Tekan ikon bookmark pada kartu barang.')}
      {tab === 'blocked' && (bl.length === 0 ? <p className="card p-10 text-center text-ink/60">Tidak ada pengguna yang kamu blokir.</p> : <ul className="card divide-y divide-ink/10">{bl.map(b => <li key={b.blocked_id} className="flex items-center gap-3 p-4"><Avatar name={b.blocked.name} url={b.blocked.avatar_url} size={40} /><b className="grow">{b.blocked.name}</b><button className="btn-ghost !py-2" onClick={() => toggleBlock(b.blocked_id)}>Buka blokir</button></li>)}</ul>)}
      {edit && <Modal title="Edit profil" onClose={() => setEdit(false)}><div className="space-y-4"><div className="flex items-center gap-4"><Avatar name={name} url={file ? URL.createObjectURL(file) : me?.avatar_url} size={64} /><input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} className="text-sm" /></div><input className="inp" value={name} onChange={e => setName(e.target.value)} placeholder="Nama tampilan" /><button className="btn w-full" disabled={busy} onClick={save}>{busy ? 'Menyimpan…' : 'Simpan'}</button></div></Modal>}
    </div>
  )
}
