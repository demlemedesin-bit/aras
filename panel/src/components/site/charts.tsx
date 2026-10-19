'use client'
import type { ReactNode } from 'react'

/** Yumuşak eğri (Catmull-Rom → Bezier) */
export function curve(pts: [number, number][]) {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`
  }
  return d
}

export const dayLabel = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })

export type Series = { name: string; data: number[]; color: string; fill?: boolean }

export function AreaChart({ labels, series, height = 190 }: { labels: string[]; series: Series[]; height?: number }) {
  const W = 600, H = 170, P = 8
  const max = Math.max(3, ...series.flatMap((s) => s.data))
  const n = labels.length
  const pts = (data: number[]): [number, number][] => data.map((v, i) => [P + (i * (W - 2 * P)) / Math.max(1, n - 1), H - P - (v / max) * (H - 2 * P)])
  const step = Math.max(1, Math.ceil(n / 6))
  return (
    <div style={{ padding: '14px 20px 16px' }}>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }} role="img" aria-label={series.map((s) => s.name).join(', ')}>
          <defs>{series.map((s, i) => <linearGradient key={i} id={`ag${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={s.color} stopOpacity=".26" /><stop offset="1" stopColor={s.color} stopOpacity="0" /></linearGradient>)}</defs>
          {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="var(--bdr)" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />)}
          {series.map((s, i) => {
            const p = pts(s.data), line = curve(p)
            return (
              <g key={i}>
                {s.fill && <path d={`${line} L${p[p.length - 1][0]},${H} L${p[0][0]},${H} Z`} fill={`url(#ag${i})`} />}
                <path d={line} fill="none" stroke={s.color} strokeWidth={s.fill ? 2.2 : 1.8} strokeDasharray={s.fill ? undefined : '5 4'} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </g>
            )
          })}
        </svg>
        <span style={{ position: 'absolute', top: 0, left: 0, fontSize: 11, color: 'var(--tx3)' }}>{max}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tx3)', fontSize: 11.5, marginTop: 8 }}>
        {labels.map((l, i) => (i % step === 0 || i === n - 1 ? <span key={i}>{l}</span> : null))}
      </div>
      {series.length > 1 && (
        <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--tx2)' }}>
          {series.map((s) => <span key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><i style={{ width: 10, height: 3, borderRadius: 2, background: s.color, display: 'inline-block' }} />{s.name}</span>)}
        </div>
      )}
    </div>
  )
}

export function Spark({ data, color = 'var(--ac)' }: { data: number[]; color?: string }) {
  const W = 84, H = 30, max = Math.max(1, ...data)
  const pts: [number, number][] = data.map((n, i) => [(i * W) / Math.max(1, data.length - 1), H - 3 - (n / max) * (H - 8)])
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <path d={curve(pts)} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color} />
    </svg>
  )
}

export function BarList({ items, empty = 'Veri yok', format }: { items: { label: ReactNode; value: number }[]; empty?: string; format?: (v: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (!items.length) return <div style={{ padding: '18px 20px', color: 'var(--tx3)' }}>{empty}</div>
  return (
    <div style={{ padding: '8px 20px 14px', display: 'grid', gap: 12 }}>
      {items.map((it, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 5 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span><b>{format ? format(it.value) : it.value}</b>
          </div>
          <div style={{ height: 6, background: 'var(--s3)', borderRadius: 99 }}><div style={{ width: `${(it.value / max) * 100}%`, height: '100%', background: 'var(--ac)', borderRadius: 99, opacity: i === 0 ? 1 : .6 }} /></div>
        </div>
      ))}
    </div>
  )
}

/** Önceki döneme göre değişim rozeti. */
export function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (!prev && !cur) return <span style={{ color: 'var(--tx3)', fontSize: 12 }}>önceki dönem: 0</span>
  if (!prev) return <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>yeni</span>
  const p = Math.round(((cur - prev) / prev) * 100)
  const up = p >= 0
  return <span style={{ color: up ? 'var(--green)' : 'var(--red)', background: up ? 'var(--green2)' : 'var(--red2)', fontSize: 11.5, fontWeight: 600, padding: '2px 7px', borderRadius: 99 }}>{up ? '▲' : '▼'} %{Math.abs(p)}</span>
}
