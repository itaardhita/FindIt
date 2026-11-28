import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase, Profile } from './lib/supabase'
import { Ctx, Notif } from './lib/ctx'
import { Sidebar, Topbar, FloatingPost } from './components/Layout'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Explore from './pages/Explore'
import NewPost from './pages/NewPost'
import PostDetail from './pages/PostDetail'
import Messages from './pages/Messages'
import MapPage from './pages/MapPage'
import History from './pages/History'
import ProfilePage from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import AuthConfirm from './pages/AuthConfirm'

function Shell({ uid }: { uid: string }) {
  const [me, setMe] = useState<Profile | null>(null)
  const [blocked, setBlocked] = useState<Set<string>>(new Set()); const [saved, setSaved] = useState<Set<string>>(new Set())
  const [notifs, setNotifs] = useState<Notif[]>([]); const [drawer, setDrawer] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('findit-theme') === 'dark')
  const { pathname } = useLocation()
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('findit-theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => setDrawer(false), [pathname])

  const reloadMe = useCallback(() => { supabase.from('profiles').select('id, name, avatar_url').eq('id', uid).single().then(({ data }) => setMe(data)) }, [uid])
  useEffect(() => {
    reloadMe()
    supabase.from('blocks').select('blocked_id').then(({ data }) => setBlocked(new Set((data ?? []).map(r => r.blocked_id))))
    supabase.from('bookmarks').select('post_id').then(({ data }) => setSaved(new Set((data ?? []).map(r => r.post_id))))
    supabase.from('notifications')
      .select('*')
      .eq('user_id', uid)
      .or(`read.eq.false,created_at.gte.${new Date(Date.now() - 30 * 86400000).toISOString()}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotifs((data as Notif[]) ?? []))
    const ch = supabase.channel('notif-' + uid).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, p => setNotifs(n => [p.new as Notif, ...n])).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [uid, reloadMe])

  const toggleSave = (id: string) => {
    const on = saved.has(id); const next = new Set(saved); on ? next.delete(id) : next.add(id); setSaved(next)
    on ? supabase.from('bookmarks').delete().eq('post_id', id).eq('user_id', uid).then(() => {}) : supabase.from('bookmarks').insert({ user_id: uid, post_id: id }).then(() => {})
  }
  const toggleBlock = async (id: string) => {
    const on = blocked.has(id); const next = new Set(blocked); on ? next.delete(id) : next.add(id); setBlocked(next)
    if (on) await supabase.from('blocks').delete().eq('blocker_id', uid).eq('blocked_id', id); else await supabase.from('blocks').insert({ blocker_id: uid, blocked_id: id })
  }
  const markRead = (ids: string[]) => { if (!ids.length) return; setNotifs(n => n.map(x => ids.includes(x.id) ? { ...x, read: true } : x)); supabase.from('notifications').update({ read: true }).in('id', ids).then(() => {}) }
async function clearNotifications() {
  const ids = notifs.filter(n => !n.dismissed).map(n => n.id)

  for (let start = 0; start < ids.length; start += 50) {
    const batch = ids.slice(start, start + 50)
    const { error } = await supabase
      .from('notifications')
      .update({ dismissed: true })
      .eq('user_id', uid)
      .in('id', batch)

    if (error) throw error

    const cleared = new Set(batch)
    setNotifs(current =>
      current.map(n => cleared.has(n.id) ? { ...n, dismissed: true } : n)
    )
  }
}
  return (
    <Ctx.Provider value={{ uid, me, reloadMe, blocked, toggleBlock, saved, toggleSave, notifs, markRead, clearNotifications, dark, toggleDark: () => setDark(!dark) }}>
      <Sidebar open={drawer} onClose={() => setDrawer(false)} />
      <div className="min-h-screen lg:pl-72">
        <Topbar onMenu={() => setDrawer(true)} />
        <main className="mx-auto max-w-6xl px-4 py-8 pb-28 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/new" element={<NewPost />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/post/:id/edit" element={<NewPost />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:id" element={<Messages />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <FloatingPost />
      </div>
    </Ctx.Provider>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])
  if (session === undefined) return <div className="grid h-screen place-items-center text-ink/60">Memuat…</div>
  if (pathname === '/auth/confirm') return <AuthConfirm session={session} />
  if (pathname === '/lupa-password') return <ForgotPassword />
  return session ? <Shell uid={session.user.id} /> : <Auth />
}
