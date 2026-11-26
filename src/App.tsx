import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Feed from './pages/Feed'
import NewPost from './pages/NewPost'
import PostDetail from './pages/PostDetail'
import Chat, { ChatList } from './pages/Chat'
import Profile from './pages/Profile'

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])
  if (session === undefined) return <div className="grid h-screen place-items-center text-ink/60">Memuat…</div>
  if (!session) return <Auth />
  const link = ({ isActive }: { isActive: boolean }) => `rounded-full px-3 py-1.5 text-sm font-bold ${isActive ? 'bg-tel text-white' : 'text-ink/70 hover:bg-ink/5'}`
  return (
    <div className="min-h-screen pb-24 sm:pb-8">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <span className="mr-auto text-xl font-extrabold tracking-tight text-tel">Find<span className="text-ink">It</span></span>
          <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-ink/10 bg-white p-2 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:gap-1">
            <NavLink to="/" end className={link}>Beranda</NavLink>
            <NavLink to="/new" className={link}>Lapor temuan</NavLink>
            <NavLink to="/chat" className={link}>Pesan</NavLink>
            <NavLink to="/profile" className={link}>Profil & riwayat</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/new" element={<NewPost uid={session.user.id} />} />
          <Route path="/post/:id" element={<PostDetail uid={session.user.id} />} />
          <Route path="/chat" element={<ChatList uid={session.user.id} />} />
          <Route path="/chat/:id" element={<Chat uid={session.user.id} />} />
          <Route path="/profile" element={<Profile uid={session.user.id} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}
