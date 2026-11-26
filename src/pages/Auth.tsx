import { FormEvent, useState } from 'react'
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
    <div className="grid min-h-screen place-items-center bg-tel px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-3xl bg-white p-6 shadow-xl">
        <h1 className="text-3xl font-extrabold text-tel">Find<span className="text-ink">It</span></h1>
        <p className="text-sm text-ink/70">Barang hilang di Telkom University Jakarta? Cari di sini, atau bantu pemiliknya menemukan barangnya.</p>
        {mode === 'register' && <input className="inp" placeholder="Nama lengkap" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />}
        <input className="inp" type="email" placeholder="Email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
        <input className="inp" type="password" placeholder="Kata sandi (min. 6 karakter)" minLength={6} required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
        {err && <p className="text-sm text-tel" role="alert">{err}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}</button>
        <button type="button" className="w-full text-sm font-bold text-ink/70 underline" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}</button>
      </form>
    </div>
  )
}
