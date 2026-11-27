import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import photo from './findit-kunci.webp'
import './AuthLanding.css'

function CampusScene({ animated }: { animated: boolean }) {
  const panel = useRef<HTMLElement>(null)
  useEffect(() => {
    const element = panel.current
    if (!element || !animated) return
    const update = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / 160))
      element.style.setProperty('--lift', String(progress))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      element.style.removeProperty('--lift')
    }
  }, [animated])
  return <aside ref={panel} className="fi-scene">
    <div className="fi-brand"><svg width="25" height="29" viewBox="0 0 24 28" aria-hidden="true"><path d="M12 26S2 17 2 11a10 10 0 0 1 20 0c0 6-10 15-10 15Z" fill="none" stroke="currentColor" strokeWidth="2.4"/><circle cx="11" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><path d="m14 13 4 4" stroke="currentColor" strokeWidth="2"/></svg>Find<span>It</span></div>
    <h1>Temukan kembali<br />yang hilang.</h1>
    {animated && <p className="fi-intro">Lost &amp; found untuk civitas Telkom University Jakarta. Barang yang ditemukan teman kampus, mungkin sedang kamu cari.</p>}
    {animated && <p className="fi-credit">Made for students, by students.</p>}
    {animated && <div className="fi-art" aria-hidden="true">
      <div className="fi-point">
        <svg viewBox="0 0 48 58">
          <path d="M24 55C20 48 3 32 3 23a21 21 0 1 1 42 0c0 9-17 25-21 32Z" fill="#d31336" stroke="#fff9f1" strokeWidth="3" />
          <circle cx="24" cy="22" r="8" fill="#fff9f1" />
        </svg>
        <span>R. Kuliah 201</span>
      </div>
      <img className="fi-photo" src={photo} alt="" />
    </div>}
  </aside>
}

export default function Auth() {
  const [register, setRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    setInfo('')
    try {
      const credentials = { email: email.trim(), password }
      const result = register
        ? await supabase.auth.signUp({ ...credentials, options: { data: { name: name.trim() } } })
        : await supabase.auth.signInWithPassword(credentials)
      if (result.error) setError(result.error.message)
      else if (register && !result.data.session) setInfo('Cek email kamu untuk konfirmasi akun, lalu masuk.')
    } catch {
      setError('Koneksi terputus. Silakan coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  function switchMode() {
    setRegister(!register)
    setPassword('')
    setShow(false)
    setError('')
    setInfo('')
    window.scrollTo(0, 0)
  }

  return <main className={register ? 'fi-auth' : 'fi-auth fi-login'}>
    <div className="fi-shell">
      <CampusScene animated={!register} />
      <section className="fi-panel">
        <form className="fi-form" onSubmit={submit}>
          <h2>{register ? 'Buat akun' : 'Masuk'}</h2>
          {register && <label>Nama lengkap<input autoComplete="name" required value={name} onChange={e => setName(e.target.value)} /></label>}
          <label>Email<input autoComplete="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
          <div>
            <label htmlFor="fi-password">Kata sandi</label>
            <div className="fi-password">
              <input id="fi-password" type={show ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 6 : undefined} value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShow(!show)}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 12Q12-2 22 12Q12 26 2 12Z"/><circle cx="12" cy="12" r="3"/>{show && <path d="m3 3 18 18"/>}</svg></button>
            </div>
          </div>
          {!register && <Link to="/lupa-password">Lupa kata sandi?</Link>}
          {error && <p role="alert">{error}</p>}
          {info && <p role="status">{info}</p>}
          <button className="fi-submit" disabled={busy}>{busy ? 'Memproses…' : register ? 'Daftar' : 'Masuk'}</button>
          <button type="button" disabled={busy} onClick={switchMode}>{register ? 'Sudah punya akun? Masuk' : 'Buat akun'}</button>
        </form>
      </section>
    </div>
  </main>
}
