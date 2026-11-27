import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return

    setError('')
    setBusy(true)

    try {
      if (step === 'email') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
        if (error) throw error
        setStep('code')
      } else if (step === 'code') {
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: code.trim(),
          type: 'recovery',
        })
        if (error) throw error
        setStep('password')
      } else if (step === 'password') {
        if (password !== confirmPassword) {
          setError('Kedua kata sandi belum sama.')
          return
        }

        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setPassword('')
        setConfirmPassword('')
        setStep('done')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Permintaan gagal. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
      <section className="card w-full max-w-sm p-6">
        <h1 className="text-2xl font-extrabold">
          {step === 'done' ? 'Kata sandi berhasil diubah' : 'Lupa kata sandi'}
        </h1>

        {step === 'done' ? (
          <Link to="/" className="btn mt-5 w-full">Buka FindIt</Link>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            {step === 'email' && (
              <label className="block text-sm">
                Email akun FindIt
                <input
                  className="inp mt-1"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </label>
            )}

            {step === 'code' && (
              <>
                <p className="text-sm text-ink/70">
                  Jika email {email.trim()} terdaftar, kamu akan menerima kode.
                  Cek juga folder spam.
                </p>
                <label className="block text-sm">
                  Kode dari email
                  <input
                    className="inp mt-1"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    required
                  />
                </label>
                <button
                  type="button"
                  disabled={busy}
                  className="text-sm font-bold text-tel"
                  onClick={() => {
                    setCode('')
                    setError('')
                    setStep('email')
                  }}
                >
                  Ubah email atau minta kode baru
                </button>
              </>
            )}

            {step === 'password' && (
              <>
                <label className="block text-sm">
                  Kata sandi baru
                  <input
                    className="inp mt-1"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </label>
                <label className="block text-sm">
                  Ulangi kata sandi baru
                  <input
                    className="inp mt-1"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </label>
              </>
            )}

            {error && <p role="alert" className="text-sm text-tel">{error}</p>}

            <button type="submit" className="btn w-full" disabled={busy}>
              {busy ? 'Memproses…' : {
                email: 'Kirim kode',
                code: 'Verifikasi kode',
                password: 'Simpan kata sandi',
              }[step]}
            </button>

            {step !== 'password' && (
              <Link to="/" className="block text-center text-sm font-bold text-ink/60">
                Kembali ke halaman masuk
              </Link>
            )}
          </form>
        )}
      </section>
    </main>
  )
}
