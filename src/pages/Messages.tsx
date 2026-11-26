import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Html5Qrcode } from 'html5-qrcode'
import { Ban, ChevronLeft, Flag, MessageCircle, QrCode, ScanLine, Send } from 'lucide-react'
import { supabase, timeWib } from '../lib/supabase'
import { useApp } from '../lib/ctx'
import { Avatar, PageTitle, Skeleton } from '../components/ui'
import ReportModal from '../components/ReportModal'

type Who = { name: string; avatar_url: string | null }
type Conv = { id: string; status: 'active' | 'closed'; finder_id: string; claimer_id: string; posts: { title: string; photos: string[] }; finder: Who; claimer: Who; last?: string; at?: string }
const SEL = '*, posts(title, photos), finder:profiles!conversations_finder_id_fkey(name, avatar_url), claimer:profiles!conversations_claimer_id_fkey(name, avatar_url)'

function Inbox({ active, className }: { active?: string; className: string }) {
  const { uid, notifs } = useApp(); const [list, setList] = useState<Conv[] | null>(null); const [tick, setTick] = useState(0)
  useEffect(() => {
    const ch = supabase.channel('inbox-' + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => setTick(t => t + 1))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => setTick(t => t + 1)).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('conversations').select(SEL); const cs = (data ?? []) as unknown as Conv[]
      if (cs.length) {
        const { data: ms } = await supabase.from('messages').select('conversation_id, body, created_at').in('conversation_id', cs.map(c => c.id)).order('created_at', { ascending: false }).limit(300)
        for (const c of cs) { const m = ms?.find(x => x.conversation_id === c.id); c.last = m?.body; c.at = m?.created_at }
      }
      setList(cs.sort((a, b) => (b.at ?? '').localeCompare(a.at ?? '')))
    })()
  }, [tick])
  const unread = new Set(notifs.filter(n => !n.read && n.type === 'message').map(n => n.link))
  return (
    <div className={`flex-col border-ink/10 lg:border-r ${className}`}>
      <div className="flex items-center justify-between border-b border-ink/10 p-5"><b className="text-lg">Inbox</b><span className="rounded-full bg-tel-soft px-2.5 py-0.5 text-sm font-bold text-tel">{list?.length ?? 0}</span></div>
      <div className="grow overflow-y-auto">
        {list === null && <div className="space-y-2 p-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-20" />)}</div>}
        {list?.length === 0 && <p className="p-6 text-sm text-ink/60">Belum ada percakapan. Buka postingan lalu tekan “Ini barang saya”.</p>}
        {list?.map(c => { const o = c.finder_id === uid ? c.claimer : c.finder; return (
          <Link key={c.id} to={`/messages/${c.id}`} className={`flex gap-3 border-b border-ink/5 p-4 hover:bg-ink/5 ${active === c.id ? 'bg-tel-soft' : ''}`}>
            <Avatar name={o.name} url={o.avatar_url} size={48} />
            <div className="min-w-0 grow"><div className="flex items-center justify-between gap-2"><b className="truncate">{o.name}</b>{unread.has(`/messages/${c.id}`) && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-tel" />}{c.status === 'closed' && <span className="text-[11px] font-bold text-green-600">Selesai</span>}</div>
              <p className="truncate text-sm text-ink/70">{c.posts.title}</p><p className="truncate text-sm text-ink/50">{c.last ?? 'Mulai percakapan…'}</p></div>
          </Link>) })}
      </div>
    </div>
  )
}

function Scanner({ onCode }: { onCode: (c: string) => void }) {
  useEffect(() => {
    const s = new Html5Qrcode('qr-reader')
    s.start({ facingMode: 'environment' }, { fps: 10, qrbox: 220 }, t => onCode(t), () => {}).catch(() => {})
    return () => { s.isScanning ? s.stop().then(() => s.clear()).catch(() => {}) : s.clear() }
  }, [])
  return <div id="qr-reader" className="mx-auto w-full max-w-xs overflow-hidden rounded-xl" />
}

function ChatPanel({ id }: { id: string }) {
  const { uid, blocked, toggleBlock, notifs, markRead } = useApp(); const nav = useNavigate()
  const [c, setC] = useState<Conv | null | undefined>(undefined)
  const [msgs, setMsgs] = useState<{ id: string; sender_id: string; body: string; created_at: string }[]>([])
  const [text, setText] = useState(''); const [token, setToken] = useState(''); const [panel, setPanel] = useState<'' | 'qr' | 'scan'>(''); const [code, setCode] = useState(''); const [note, setNote] = useState(''); const [report, setReport] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const load = () => supabase.from('conversations').select(SEL).eq('id', id).maybeSingle().then(({ data }) => setC(data as unknown as Conv | null))
  useEffect(() => {
    load()
    supabase.from('messages').select('id, sender_id, body, created_at').eq('conversation_id', id).order('created_at').then(({ data }) => setMsgs(data ?? []))
    const ch = supabase.channel(`chat-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, p => setMsgs(m => m.some(x => x.id === p.new.id) ? m : [...m, p.new as never]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `id=eq.${id}` }, () => load()).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [id])
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length])
  useEffect(() => { markRead(notifs.filter(n => !n.read && n.link === `/messages/${id}`).map(n => n.id)) }, [notifs.length, id])
  if (c === undefined) return <Skeleton className="m-4 h-64 grow" />
  if (c === null) return <p className="m-auto text-ink/60">Percakapan tidak ditemukan.</p>
  const isFinder = c.finder_id === uid, closed = c.status === 'closed', other = isFinder ? c.claimer : c.finder, otherId = isFinder ? c.claimer_id : c.finder_id, isBlocked = blocked.has(otherId)
  async function send() { if (!text.trim()) return; const b = text; setText(''); const { error } = await supabase.from('messages').insert({ conversation_id: id, sender_id: uid, body: b }); if (error) setNote('Pesan tidak terkirim. Pengguna ini mungkin memblokirmu.') }
  async function showToken() { const { data } = await supabase.from('handover_tokens').select('token').eq('conversation_id', id).single(); setToken(data?.token ?? ''); setPanel(panel === 'qr' ? '' : 'qr') }
  async function finish(t: string) { setPanel(''); const { error } = await supabase.rpc('complete_handover', { p_conversation: id, p_token: t }); setNote(error ? error.message : 'Serah terima selesai. Postingan masuk ke riwayat.'); if (!error) load() }
  return (
    <div className="flex min-h-0 w-full grow flex-col">
      <div className="flex items-center gap-3 border-b border-ink/10 p-4">
        <button className="lg:hidden" aria-label="Kembali" onClick={() => nav('/messages')}><ChevronLeft /></button>
        <Avatar name={other.name} url={other.avatar_url} size={44} />
        <div className="min-w-0 grow"><p className="truncate font-bold">{other.name}</p><p className="truncate text-xs text-ink/60">{c.posts.title} · {closed ? 'Selesai' : 'Aktif'}</p></div>
        <button className="icon-btn !h-10 !w-10" aria-label="Laporkan pengguna" onClick={() => setReport(true)}><Flag size={17} /></button>
        <button className="icon-btn !h-10 !w-10" aria-label={isBlocked ? 'Buka blokir' : 'Blokir pengguna'} onClick={() => confirm(isBlocked ? 'Buka blokir?' : 'Blokir pengguna ini?') && toggleBlock(otherId)}><Ban size={17} className={isBlocked ? 'text-tel' : ''} /></button>
      </div>
      <div className="min-h-0 grow space-y-2 overflow-y-auto p-4">
        {msgs.map(m => <div key={m.id} className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.sender_id === uid ? 'ml-auto rounded-br-md bg-tel text-white' : 'rounded-bl-md bg-ink/5'}`}>{m.body}<span className={`mt-0.5 block text-[10px] ${m.sender_id === uid ? 'text-white/70' : 'text-ink/40'}`}>{timeWib(m.created_at)}</span></div>)}
        <div ref={end} />
      </div>
      {note && <p className="px-4 pb-2 text-center text-sm" role="status">{note}</p>}
      {closed ? <p className="border-t border-ink/10 p-4 text-center text-sm text-green-600">Barang sudah diserahterimakan. Percakapan ditutup.</p> : (
        <div className="space-y-3 border-t border-ink/10 p-3">
          {panel === 'qr' && <div className="rounded-xl bg-tel-soft p-4 text-center"><div className="mx-auto w-fit rounded-xl bg-white p-3"><QRCodeSVG value={token} size={150} /></div><p className="mt-2 text-sm">Kode: <b className="tracking-widest">{token}</b></p><p className="text-xs text-ink/60">Tunjukkan ke penemu saat serah terima.</p></div>}
          {isFinder && panel === 'scan' && <><Scanner onCode={finish} /><div className="flex gap-2"><input className="inp" placeholder="Atau ketik kode serah terima" value={code} onChange={e => setCode(e.target.value)} /><button className="btn-ghost" onClick={() => finish(code)}>Konfirmasi</button></div></>}
          <div className="flex gap-2">
            {!isFinder && <button className="icon-btn shrink-0" aria-label="Tampilkan QR" onClick={showToken}><QrCode size={20} /></button>}
            {isFinder && <button className="icon-btn shrink-0" aria-label="Scan QR" onClick={() => setPanel(panel === 'scan' ? '' : 'scan')}><ScanLine size={20} /></button>}
            <input className="inp" placeholder="Tulis pesan…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="btn shrink-0" aria-label="Kirim" onClick={send}><Send size={18} /></button>
          </div>
        </div>)}
      {report && <ReportModal userId={otherId} onClose={() => setReport(false)} />}
    </div>
  )
}

export default function Messages() {
  const { id } = useParams()
  return (
    <div>
      <PageTitle title="Messages" sub="Komunikasi dengan penemu barang." />
      <div className="card flex h-[calc(100vh-15rem)] min-h-[30rem] overflow-hidden">
        <Inbox active={id} className={`${id ? 'hidden lg:flex' : 'flex'} w-full lg:w-[22rem] lg:shrink-0`} />
        {id ? <ChatPanel key={id} id={id} /> : (
          <div className="hidden grow place-items-center text-center lg:grid"><div><MessageCircle size={44} className="mx-auto text-ink/40" /><p className="mt-3 font-bold">Pilih percakapan</p><p className="max-w-xs text-sm text-ink/60">Mulai chat dengan penemu barang untuk mengatur proses pengambilan.</p></div></div>)}
      </div>
    </div>
  )
}
