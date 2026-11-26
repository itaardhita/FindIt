import { FormEvent, useState } from 'react'
import FindItLogo from '../components/FindItLogo'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [info, setInfo] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr(''); setInfo('')
    const { error, data } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: f.email, password: f.password })
      : await supabase.auth.signUp({ email: f.email, password: f.password, options: { data: { name: f.name } } })
    if (error) setErr(error.message)
    else if (mode === 'register' && !data.session) setInfo('Akun dibuat. Cek email kamu untuk konfirmasi, lalu masuk.')
    setBusy(false)
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-tel p-12 text-white lg:flex">
<span className="flex items-center gap-3 text-2xl font-extrabold">
  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
    <FindItLogo />
  </span>
  FindIt
</span>
        <div><h1 className="text-5xl font-extrabold leading-tight">Temukan kembali<br />yang hilang.</h1><p className="mt-4 max-w-sm text-white/80">Lost & found untuk civitas Telkom University Jakarta. Barang yang ditemukan teman kampus, mungkin sedang kamu cari.</p></div>
        <p className="text-sm text-white/60">Made for students, by students.</p>
      </div>
      <div className="grid place-items-center px-4">
        <form onSubmit={submit} className="w-full max-w-sm space-y-3">
          <h2 className="text-3xl font-extrabold">{mode === 'login' ? 'Masuk' : 'Buat akun'}</h2>
          <p className="pb-2 text-sm text-ink/60">{mode === 'login' ? 'Selamat datang kembali di FindIt.' : 'Gabung dan bantu barang pulang ke pemiliknya.'}</p>
          {mode === 'register' && <input className="inp" placeholder="Nama lengkap" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />}
          <input className="inp" type="email" placeholder="Email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
          <input className="inp" type="password" placeholder="Kata sandi (min. 6 karakter)" minLength={6} required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
          {err && <p className="text-sm text-tel" role="alert">{err}</p>}
          {info && <p className="text-sm text-green-600">{info}</p>}
          <button className="btn w-full !py-3" disabled={busy}>{busy ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}</button>
          <button type="button" className="w-full text-sm font-bold text-ink/60 underline" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}</button>
        </form>
      </div>
    </div>
  )
}
