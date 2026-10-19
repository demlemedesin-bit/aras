'use client'
import { useEffect, useRef, useState } from 'react'

export const hexToHsl = (hex: string): [number, number, number] => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return [0, 0, 0]
  const n = parseInt(m[1], 16); const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60 }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]
}
export const hslToHex = (h: number, s: number, l: number) => {
  s /= 100; l /= 100; const k = (n: number) => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l)
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))))
  return '#' + [f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, '0')).join('')
}
const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] }
export const contrast = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }

const SW = ['#000000', '#1d1d1d', '#4f5555', '#9aa3a3', '#d8dcdc', '#eceeee', '#ffffff', '#10361a', '#1e7a1c', '#299826', '#8dc47e', '#e9f5e4', '#0b2a4a', '#1f7ae0', '#8ec1f5', '#3a2410', '#b5651d', '#e0b48a', '#3a0a0e', '#d3202c', '#f0868d', '#f5a524', '#ffd84d', '#7a3fd0']

/** Gelişmiş renk seçici: ton/doygunluk/açıklık, hex, hazır renkler, damlalık, karşıtlık denetimi. */
export function ColorPicker({ value, onChange, against, title }: { value: string; onChange: (v: string) => void; against?: string; title?: string }) {
  const [open, setOpen] = useState(false)
  const [hex, setHex] = useState(value)
  const ref = useRef<HTMLDivElement>(null)
  const [h, s, l] = hexToHsl(value)
  useEffect(() => setHex(value), [value])
  useEffect(() => {
    if (!open) return
    const k = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    addEventListener('mousedown', k); return () => removeEventListener('mousedown', k)
  }, [open])
  const set = (nh = h, ns = s, nl = l) => onChange(hslToHex(nh, ns, nl))
  const ratio = against && /^#[0-9a-f]{6}$/i.test(against) ? contrast(value, against) : null
  const slider = (label: string, val: number, max: number, bg: string, on: (v: number) => void) => (
    <label style={{ display: 'grid', gridTemplateColumns: '64px 1fr 34px', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--tx3)' }}>
      {label}
      <input type="range" min={0} max={max} value={val} onChange={(e) => on(+e.target.value)} style={{ width: '100%', height: 10, borderRadius: 6, background: bg, appearance: 'none', WebkitAppearance: 'none' }} />
      <span>{val}</span>
    </label>
  )
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" title={title} onClick={() => setOpen((o) => !o)} aria-label={title ?? 'Renk seç'} style={{ width: 40, height: 32, borderRadius: 8, background: value, border: '1px solid var(--bdr)', cursor: 'pointer', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.35)' }} />
      {open && (
        <div className="card" style={{ position: 'absolute', zIndex: 40, left: 0, top: 38, width: 268, padding: 12, display: 'grid', gap: 9, boxShadow: '0 14px 40px rgba(0,0,0,.45)' }}>
          <div style={{ height: 54, borderRadius: 8, background: value, border: '1px solid var(--bdr)' }} />
          {slider('Ton', h, 360, 'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)', (v) => set(v))}
          {slider('Doygunluk', s, 100, `linear-gradient(90deg,${hslToHex(h, 0, l)},${hslToHex(h, 100, l)})`, (v) => set(h, v))}
          {slider('Açıklık', l, 100, `linear-gradient(90deg,#000,${hslToHex(h, s, 50)},#fff)`, (v) => set(h, s, v))}
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="inp" value={hex} spellCheck={false} onChange={(e) => { const v = e.target.value; setHex(v); if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v.toLowerCase()) }} style={{ fontFamily: 'monospace' }} />
            {typeof window !== 'undefined' && 'EyeDropper' in window && (
              <button type="button" className="btn-ghost" onClick={async () => { try { const r = await new (window as any).EyeDropper().open(); onChange(r.sRGBHex.toLowerCase()) } catch { /* iptal */ } }}>Damlalık</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 5 }}>
            {SW.map((c) => <button key={c} type="button" aria-label={c} onClick={() => onChange(c)} style={{ aspectRatio: '1', borderRadius: 6, background: c, border: c === value ? '2px solid var(--ac)' : '1px solid var(--bdr)', cursor: 'pointer' }} />)}
          </div>
          {ratio !== null && <div style={{ fontSize: 12, color: ratio >= 4.5 ? 'var(--green)' : ratio >= 3 ? 'var(--amber)' : 'var(--red)' }}>Okunabilirlik: {ratio.toFixed(1)}:1 {ratio >= 4.5 ? '(iyi)' : ratio >= 3 ? '(büyük yazı için yeterli)' : '(zayıf)'}</div>}
        </div>
      )}
    </div>
  )
}
