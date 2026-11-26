import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Archive, Bell, CheckCircle2, Compass, Home, LogOut, Menu, MessageCircle, MapPin, MoreHorizontal, Moon, PackageSearch, Plus, Search, Sun, User, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/ctx'
import { Avatar } from './ui'
import FindItLogo from './FindItLogo'

const ago = (s: string) => { const m = Math.round((Date.now() - new Date(s).getTime()) / 60000); return m < 1 ? 'baru saja' : m < 60 ? `${m} mnt lalu` : m < 1440 ? `${Math.round(m / 60)} jam lalu` : `${Math.round(m / 1440)} hari lalu` }

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
const { me, notifs, dark } = useApp(); const [menu, setMenu] = useState(false)
  const unreadMsg = new Set(notifs.filter(n => !n.read && n.type === 'message').map(n => n.link)).size
  const items = [{ to: '/', label: 'Home', Icon: Home }, { to: '/explore', label: 'Explore', Icon: Compass }, { to: '/messages', label: 'Messages', Icon: MessageCircle, badge: unreadMsg }, { to: '/map', label: 'Campus Map', Icon: MapPin }, { to: '/history', label: 'History', Icon: Archive }, { to: '/profile', label: 'My Profile', Icon: User }]
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-ink/10 bg-surface p-4 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
<div className="flex items-center gap-3 px-2 py-3">
  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-tel-soft text-tel">
    <FindItLogo size={26} />
  </span>
  <div>
<p className={`w-fit rounded-md px-2 text-xl font-extrabold leading-tight ${dark ? 'bg-transparent text-white' : 'bg-white text-[#252529]'}`}>
  Find<span className={dark ? 'text-red-400' : 'text-[#89143B]'}>It</span>
</p>
    <p className="text-sm text-ink/60">Tel-U Lost & Found</p>
  </div>
  <button className="ml-auto lg:hidden" aria-label="Tutup menu" onClick={onClose}>
    <X />
  </button>
</div>
        <p className="mb-2 mt-8 px-3 text-xs font-bold tracking-wider text-ink/40">MENU</p>
        <nav className="space-y-1">
          {items.map(({ to, label, Icon, badge }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 font-bold transition ${isActive ? 'bg-tel-soft text-tel' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'}`}>
              <Icon size={21} />{label}{!!badge && <span className="ml-auto grid h-6 min-w-6 place-items-center rounded-full bg-tel px-1.5 text-xs text-white">{badge}</span>}
            </NavLink>))}
        </nav>
        <div className="mt-auto border-t border-ink/10 pt-4">
          <div className="relative flex items-center gap-3 px-1">
            <Avatar name={me?.name} url={me?.avatar_url} size={44} />
            <div className="min-w-0 grow"><p className="truncate font-bold">{me?.name}</p><p className="text-sm text-ink/60">Tel-U Jakarta</p></div>
            <button aria-label="Menu akun" className="rounded-lg p-2 hover:bg-ink/5" onClick={() => setMenu(!menu)}><MoreHorizontal size={20} /></button>
            {menu && <button onClick={() => supabase.auth.signOut()} className="pop card absolute bottom-14 right-0 flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-tel shadow-lg"><LogOut size={16} />Keluar</button>}
          </div>
          <p className="mt-4 px-1 text-xs text-ink/40">FindIt · Campus community<br />Made for students, by students.</p>
        </div>
      </aside>
    </>
  )
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { me, dark, toggleDark, notifs, markRead } = useApp(); const nav = useNavigate(); const [q, setQ] = useState(''); const [bell, setBell] = useState(false)
  const input = useRef<HTMLInputElement>(null); const bellRef = useRef<HTMLDivElement>(null)
  const unread = notifs.filter(n => !n.read)
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.current?.focus() } }
    const c = (e: MouseEvent) => { if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBell(false) }
    window.addEventListener('keydown', k); document.addEventListener('mousedown', c)
    return () => { window.removeEventListener('keydown', k); document.removeEventListener('mousedown', c) }
  }, [])
  const Ico = (t: string) => t === 'message' ? MessageCircle : t === 'handover' ? CheckCircle2 : PackageSearch
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink/10 bg-surface/90 px-4 py-3 backdrop-blur lg:px-8">
      <button className="icon-btn lg:hidden" aria-label="Buka menu" onClick={onMenu}><Menu size={20} /></button>
      <form className="relative max-w-xl grow" onSubmit={e => { e.preventDefault(); nav(`/explore?q=${encodeURIComponent(q)}`) }}>
        <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input ref={input} className="inp !rounded-2xl !py-3 !pl-11 !pr-14" placeholder="Cari barang, lokasi, atau kategori…" value={q} onChange={e => setQ(e.target.value)} />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-ink/15 px-1.5 py-0.5 text-xs text-ink/40 sm:block">⌘ K</kbd>
      </form>
      <div className="ml-auto flex items-center gap-2">
        <button className="icon-btn" aria-label={dark ? 'Mode terang' : 'Mode gelap'} onClick={toggleDark}>{dark ? <Sun size={20} /> : <Moon size={20} />}</button>
        <div className="relative" ref={bellRef}>
          <button className="icon-btn relative" aria-label="Notifikasi" onClick={() => setBell(!bell)}><Bell size={20} />{unread.length > 0 && <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-sun ring-2 ring-surface" />}</button>
          {bell && (
            <div className="pop card absolute right-0 top-14 w-80 max-w-[85vw] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-ink/10 p-3"><b>Notifikasi</b>{unread.length > 0 && <button className="text-xs font-bold text-tel" onClick={() => markRead(unread.map(n => n.id))}>Tandai semua dibaca</button>}</div>
              <div className="max-h-96 overflow-y-auto">
                {notifs.length === 0 && <p className="p-6 text-center text-sm text-ink/60">Belum ada notifikasi.</p>}
                {notifs.map(n => { const I = Ico(n.type); return (
                  <button key={n.id} onClick={() => { markRead([n.id]); setBell(false); if (n.link) nav(n.link) }} className={`flex w-full gap-3 border-b border-ink/5 p-3 text-left hover:bg-ink/5 ${n.read ? '' : 'bg-tel-soft/60'}`}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tel-soft text-tel"><I size={17} /></span>
                    <span className="min-w-0"><b className="block truncate text-sm">{n.title}</b><span className="block truncate text-xs text-ink/60">{n.body}</span><span className="text-[11px] text-ink/40">{ago(n.created_at)}</span></span>
                  </button>) })}
              </div>
            </div>)}
        </div>
        <Link to="/profile" aria-label="Profil"><Avatar name={me?.name} url={me?.avatar_url} size={44} /></Link>
      </div>
    </header>
  )
}

export function FloatingPost() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/new') || pathname.endsWith('/edit')) return null
  return <Link to="/new" className="btn fixed bottom-6 right-6 z-30 !rounded-2xl !px-6 !py-4 text-base shadow-xl"><Plus size={22} />Post barang</Link>
}
