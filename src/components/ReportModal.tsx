import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/ctx'
import { Modal } from './ui'

const REASONS = ['Spam atau iklan', 'Barang bukan temuan asli', 'Konten tidak pantas', 'Penipuan atau mencurigakan', 'Lainnya']
export default function ReportModal({ postId, userId, onClose }: { postId?: string; userId?: string; onClose: () => void }) {
  const { uid } = useApp()
  const [reason, setReason] = useState(REASONS[0]); const [details, setDetails] = useState(''); const [done, setDone] = useState(false); const [err, setErr] = useState('')
  async function send() {
    const { error } = await supabase.from('reports').insert({ reporter_id: uid, post_id: postId ?? null, reported_user_id: userId ?? null, reason, details: details || null })
    if (error) setErr(error.message); else setDone(true)
  }
  return (
    <Modal title={postId ? 'Laporkan postingan' : 'Laporkan pengguna'} onClose={onClose}>
      {done ? <><p className="text-sm">Laporan terkirim. Terima kasih sudah menjaga komunitas FindIt.</p><button className="btn mt-4 w-full" onClick={onClose}>Selesai</button></> : (
        <div className="space-y-3">
          <select className="inp" value={reason} onChange={e => setReason(e.target.value)}>{REASONS.map(r => <option key={r}>{r}</option>)}</select>
          <textarea className="inp" rows={3} placeholder="Detail tambahan (opsional)" value={details} onChange={e => setDetails(e.target.value)} />
          {err && <p className="text-sm text-tel">{err}</p>}
          <button className="btn w-full" onClick={send}>Kirim laporan</button>
        </div>)}
    </Modal>
  )
}
