import { useRef, useState } from 'react'
import { FLOORS, ROOMS, getRoom } from '../data/campus'

type Props = { floor?: number; onFloor?: (n: number) => void; highlight?: string; onPick?: (floor: number, room: string) => void; height?: string; pins?: Record<string, number>; selectedItemCount?: number }

export default function CampusMap({ floor: f0 = 1, onFloor, highlight, onPick, height = 'h-[22rem]', pins, selectedItemCount }: Props) {
  const [fl, setFl] = useState(f0)
  const floor = onFloor ? f0 : fl
  const [t, setT] = useState({ x: 0, y: 0, k: 1 })
  const [hover, setHover] = useState<string | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const vb = FLOORS[floor].vb.split(' ').map(Number)
  const rooms = ROOMS.filter(r => r.floor === floor)
const hl = highlight && floor === f0
  ? getRoom(floor, highlight)
  : undefined
  const isCampusMap = selectedItemCount !== undefined
  let caption = onPick
    ? 'Klik ruangan untuk memilih lokasi. Geser untuk menggeser denah.'
    : 'Geser dan zoom untuk melihat denah.'

  if (selectedItemCount !== undefined) {
    if (hl) {
      caption = selectedItemCount > 0 ? `Barang ada di: ${hl.name}` : hl.name
    }
  } else if (hover && hover !== hl?.name) {
    caption = hover
  } else if (hl) {
    caption = `Barang ada di: ${hl.name}`
  }
  const zoom = (d: number) => setT(s => ({ ...s, k: Math.min(4, Math.max(1, s.k * d)) }))
  const changeFloor = (n: number) => { setFl(n); onFloor?.(n); setT({ x: 0, y: 0, k: 1 }) }

  return (
    <div className="card p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {Object.entries(FLOORS).map(([n, f]) => (
          <button key={n} type="button" onClick={() => changeFloor(+n)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${floor === +n ? 'bg-tel text-white' : 'bg-ink/5 hover:bg-ink/10'}`}>{f.label}</button>
        ))}
        <div className="ml-auto flex gap-1">
          <button type="button" aria-label="Perbesar" className="btn-ghost !px-3 !py-1" onClick={() => zoom(1.4)}>+</button>
          <button type="button" aria-label="Perkecil" className="btn-ghost !px-3 !py-1" onClick={() => zoom(1 / 1.4)}>−</button>
          <button type="button" className="btn-ghost !px-3 !py-1" onClick={() => setT({ x: 0, y: 0, k: 1 })}>Reset</button>
        </div>
      </div>
      <svg ref={svg} viewBox={FLOORS[floor].vb} className={`w-full ${height} cursor-grab touch-none rounded-xl bg-paper active:cursor-grabbing`}
        onWheel={e => zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15)}
onPointerDown={e => {
  drag.current = { x: e.clientX, y: e.clientY, moved: false }
  if (e.target instanceof Element) {
    e.target.setPointerCapture(e.pointerId)
  }
}}
        onPointerMove={e => {
          const d = drag.current; if (!d || !svg.current) return
          const s = vb[2] / svg.current.getBoundingClientRect().width
          const dx = (e.clientX - d.x) * s, dy = (e.clientY - d.y) * s
          if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true
          d.x = e.clientX; d.y = e.clientY
          setT(p => ({ ...p, x: p.x + dx, y: p.y + dy }))
        }}
        onPointerUp={() => setTimeout(() => (drag.current = null), 0)}>
        <g transform={`translate(${vb[0] + vb[2] / 2} ${vb[1] + vb[3] / 2}) scale(${t.k}) translate(${-(vb[0] + vb[2] / 2) + t.x / t.k} ${-(vb[1] + vb[3] / 2) + t.y / t.k})`}>
          {rooms.map(r => {
          const on = floor === f0 && highlight === r.id
          const cx = r.x + r.w / 2
          const cy = r.y + r.h / 2
            return (
              <g key={r.id} className={onPick && !r.stairs ? 'cursor-pointer' : ''}
                onPointerEnter={() => setHover(r.name)} onPointerLeave={() => setHover(null)}
                onClick={() => { if (!drag.current?.moved && onPick && !r.stairs) onPick(floor, r.id) }}>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={r.c} opacity={hl && !on ? 0.45 : 1} stroke="#1A1D2E" strokeWidth={on ? 4 : 1.5} />
                {pins?.[`${floor}:${r.id}`] ? <g><circle cx={r.x + r.w - 6} cy={r.y + 6} r="10" fill="#C8102E" stroke="white" strokeWidth="2" /><text x={r.x + r.w - 6} y={r.y + 10.5} textAnchor="middle" fontSize="11" fontWeight="800" fill="white">{pins[`${floor}:${r.id}`]}</text></g> : null}
                {r.stairs
                  ? <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">Tangga</text>
                  : <><circle cx={cx} cy={cy} r={Math.min(15, r.w / 3, r.h / 2.5)} fill="white" /><text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#1A1D2E" pointerEvents="none">{r.id}</text></>}
              </g>
            )
          })}
{hl && !isCampusMap && (
            <g pointerEvents="none">
              <circle cx={hl.x + hl.w / 2} cy={hl.y - 8} r="9" fill="#C8102E" stroke="white" strokeWidth="2.5"><animate attributeName="r" values="8;12;8" dur="1.4s" repeatCount="indefinite" /></circle>
            </g>
          )}
        </g>
      </svg>
      <p className="mt-2 min-h-5 text-sm text-ink/70" aria-live="polite">
        {caption}
      </p>
    </div>
  )
}
