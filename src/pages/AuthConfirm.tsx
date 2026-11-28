import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'

export default function AuthConfirm({ session }: { session: Session | null }) {
  const [failed] = useState(() => {
    const query = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.slice(1))
    return query.has('error') || query.has('error_code') || hash.has('error') || hash.has('error_code')
  })
  const ok = !failed && !!session?.user.email_confirmed_at
  return <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
    <section className="card w-full max-w-md space-y-4 p-6 text-center">
      <p className="font-extrabold text-tel">FindIt</p>
      <h1 className="text-2xl font-extrabold">{ok ? 'Akun siap digunakan' : 'Konfirmasi akun'}</h1>
      <p className="text-ink/70">{ok ? 'Email akun yang sedang masuk sudah terverifikasi.' : failed ? 'Link konfirmasi tidak valid atau sudah kedaluwarsa. Kembali ke halaman masuk untuk meminta email baru.' : 'Silakan masuk menggunakan akun yang telah dikonfirmasi. Jika belum berhasil, minta email konfirmasi baru.'}</p>
      <Link to="/" replace className="btn w-full">{ok ? 'Buka FindIt' : 'Kembali ke halaman masuk'}</Link>
    </section>
  </main>
}
