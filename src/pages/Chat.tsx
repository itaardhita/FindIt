import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../lib/supabase'

type Conv = { id: string; status: 'active' | 'closed'; finder_id: string; claimer_id: string; posts: { title: string; photos: string[] }; finder: { name: string }; claimer: { name: string } }
const SEL = '*, posts(title, photos), finder:profiles!conversations_finder_id_fkey(name), claimer:profiles!conversations_claimer_id_fkey(name)'

export function ChatList({ uid }: { uid: string }) {
  const [list, setList] = useState<Conv[] | null>(null)
  useEffect(() => { supabase.from('conversations').select(SEL).order('created_at', { ascending: false }).then(({ data }) => setList((data as unknown as Conv[]) ?? [])) }, [])
  if (!list) return <div className="h-40 animate-pulse rounded-2xl bg-ink/5" />
  return (
    <div className="mx-auto max-w-xl space-y-2">
      <h1 className="text-2xl font-extrabold">Pesan</h1>
      {list.length === 0 && <p className="rounded-2xl bg-white p-6 text-ink/70">Belum ada percakapan. Buka postingan lalu tekan “Ini barang saya” untuk memulai.</p>}
      {list.map(c => (
        <Link key={c.id} to={`/chat/${c.id}`} className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white p-4 hover:border-tel/40">
          <div><p className="font-bold">{c.posts.title}</p><p className="text-sm text-ink/60">dengan {c.finder_id === uid ? c.claimer.name : c.finder.name}</p></div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.status === 'active' ? 'bg-sun/30' : 'bg-ink/10'}`}>{c.status === 'active' ? 'Aktif' : 'Selesai'}</span>
        </Link>))}
    </div>
  )
}

function Scanner({ onCode }: { onCode: (c: string) => void }) {
  useEffect(() => {
    const s = new Html5Qrcode('qr-reader')
    s.start({ facingMode: 'environment' }, { fps: 10, qrbox: 220 }, txt => onCode(txt), () => {}).catch(() => {})
    return () => { s.isScanning ? s.stop().then(() => s.clear()).catch(() => {}) : s.clear() }
  }, [])
  return <div id="qr-reader" className="mx-auto w-full max-w-xs overflow-hidden rounded-xl" />
}

export default function Chat({ uid }: { uid: string }) {
  const { id } = useParams()
  const [c, setC] = useState<Conv | null>(null)
  const [msgs, setMsgs] = useState<{ id: string; sender_id: string; body: string }[]>([])
  const [text, setText] = useState(''); const [token, setToken] = useState(''); const [showQR, setShowQR] = useState(false)
  const [scan, setScan] = useState(false); const [code, setCode] = useState(''); const [msg, setMsg] = useState('')
  const end = useRef<HTMLDivElement>(null)
  const load = () => supabase.from('conversations').select(SEL).eq('id', id).single().then(({ data }) => setC(data as unknown as Conv))
  useEffect(() => {
    load()
    supabase.from('messages').select('id, sender_id, body').eq('conversation_id', id).order('created_at').then(({ data }) => setMsgs(data ?? []))
    const ch = supabase.channel(`chat-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, p => setMsgs(m => m.some(x => x.id === p.new.id) ? m : [...m, p.new as never]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `id=eq.${id}` }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [id])
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])
  if (!c) return <div className="h-64 animate-pulse rounded-2xl bg-ink/5" />
  const isFinder = c.finder_id === uid, closed = c.status === 'closed'
  async function send() { if (!text.trim()) return; const b = text; setText(''); await supabase.from('messages').insert({ conversation_id: id, sender_id: uid, body: b }) }
  async function showToken() { const { data } = await supabase.from('handover_tokens').select('token').eq('conversation_id', id).single(); setToken(data?.token ?? ''); setShowQR(true) }
  async function finish(t: string) {
    setScan(false); const { error } = await supabase.rpc('complete_handover', { p_conversation: id, p_token: t })
    setMsg(error ? error.message : 'Serah terima selesai. Postingan masuk ke riwayat.'); if (!error) load()
  }
  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-xl flex-col rounded-2xl border border-ink/10 bg-white">
      <div className="border-b border-ink/10 p-3"><p className="font-bold">{c.posts.title}</p><p className="text-xs text-ink/60">dengan {isFinder ? c.claimer.name : c.finder.name} · {closed ? 'Selesai' : 'Aktif'}</p></div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {msgs.map(m => <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender_id === uid ? 'ml-auto bg-tel text-white' : 'bg-ink/5'}`}>{m.body}</div>)}
        <div ref={end} />
      </div>
      {!closed && (
        <div className="space-y-2 border-t border-ink/10 p-3">
          {showQR && <div className="rounded-xl bg-tel-soft p-3 text-center"><QRCodeSVG value={token} size={160} className="mx-auto" /><p className="mt-2 text-sm">Kode: <b className="tracking-widest">{token}</b></p><p className="text-xs text-ink/60">Tunjukkan ke penemu saat serah terima.</p></div>}
          {isFinder && scan && <Scanner onCode={finish} />}
          {isFinder && (<div className="flex gap-2"><input className="inp" placeholder="Atau ketik kode serah terima" value={code} onChange={e => setCode(e.target.value)} /><button className="btn-ghost" onClick={() => finish(code)}>Konfirmasi</button></div>)}
          <div className="flex gap-2">
            {!isFinder && <button className="btn-ghost" onClick={showToken}>Tampilkan QR</button>}
            {isFinder && <button className="btn-ghost" onClick={() => setScan(!scan)}>{scan ? 'Tutup kamera' : 'Scan QR'}</button>}
            <input className="inp" placeholder="Tulis pesan…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="btn" onClick={send}>Kirim</button>
          </div>
        </div>
      )}
      {closed && <p className="border-t border-ink/10 p-3 text-center text-sm text-green-700">Barang sudah diserahterimakan. Percakapan ditutup.</p>}
      {msg && <p className="p-3 text-center text-sm" role="status">{msg}</p>}
    </div>
  )
}
