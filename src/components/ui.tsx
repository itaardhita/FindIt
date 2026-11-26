import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

const tones = ['bg-rose-200 text-rose-900', 'bg-sky-200 text-sky-900', 'bg-emerald-200 text-emerald-900', 'bg-violet-200 text-violet-900', 'bg-amber-200 text-amber-900']
export const initials = (n = '?') => n.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
export function Avatar({ name, url, size = 40 }: { name?: string; url?: string | null; size?: number }) {
  const tone = tones[[...(name ?? '')].reduce((a, c) => a + c.charCodeAt(0), 0) % tones.length]
  const st = { width: size, height: size, fontSize: size * 0.36 }
  return url ? <img src={url} alt={name} style={st} className="shrink-0 rounded-full object-cover" />
    : <span style={st} className={`grid shrink-0 place-items-center rounded-full font-bold ${tone}`} aria-label={name}>{initials(name)}</span>
}
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onMouseDown={onClose}>
      <div role="dialog" aria-label={title} className="pop card w-full max-w-md p-5 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold">{title}</h2><button aria-label="Tutup" onClick={onClose} className="rounded-lg p-1 hover:bg-ink/5"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  )
}
export const Skeleton = ({ className = '' }: { className?: string }) => <div className={`animate-pulse rounded-2xl bg-ink/5 ${className}`} />
export const PageTitle = ({ title, sub }: { title: string; sub?: string }) => (<div className="mb-5"><h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>{sub && <p className="mt-1 text-ink/60">{sub}</p>}</div>)
