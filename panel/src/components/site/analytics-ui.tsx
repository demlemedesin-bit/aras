'use client'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, type Row } from './ui'

export const fmtDur = (s: number) => (!s ? '–' : s < 60 ? `${s} sn` : `${Math.floor(s / 60)} dk ${s % 60 ? (s % 60) + ' sn' : ''}`.trim())
export const fmtNum = (n: number) => n.toLocaleString('tr-TR')
export const fmtPct = (n: number) => `%${String(n).replace('.', ',')}`
export const country = (c: string) => { try { return c && c.length === 2 ? new Intl.DisplayNames(['tr'], { type: 'region' }).of(c) ?? c : c || '—' } catch { return c } }
export const when = (iso: string) => new Date(iso).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
export const ago = (iso: string) => { const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000)); return s < 60 ? `${s} sn önce` : s < 3600 ? `${Math.floor(s / 60)} dk önce` : `${Math.floor(s / 3600)} sa önce` }
export const DEVICE: Record<string, string> = { mobile: 'Telefon', desktop: 'Bilgisayar', tablet: 'Tablet' }
export const LANGN: Record<string, string> = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', fr: 'Fransızca', es: 'İspanyolca', it: 'İtalyanca' }
export const EVENT: Record<string, string> = { catalog_open: 'Katalog formu açıldı', catalog_submit: 'Katalog talebi gönderildi', contact_submit: 'İletişim formu gönderildi', dealer_register: 'Bayi başvurusu', dealer_login: 'Bayi girişi', product_click: 'Ürüne tıklandı', collection_click: 'Koleksiyona tıklandı', tour_open: '360° tur açıldı', phone_click: 'Telefona tıklandı', mail_click: 'E-postaya tıklandı', whatsapp_click: 'WhatsApp\'a tıklandı', map_click: 'Haritaya tıklandı', social_click: 'Sosyal medyaya tıklandı', lang_change: 'Dil değiştirildi' }
export const CONV = ['catalog_submit', 'contact_submit', 'dealer_register']
export const SECTION: Record<string, string> = { top: 'Açılış', tarihce: 'Tarihçe', hakkimizda: 'Hakkımızda', koleksiyonlar: 'Koleksiyonlar', urunler: 'Ürünler', galeri: 'Galeri', showroom: 'Showroom', surdurulebilirlik: 'Sürdürülebilirlik', haberler: 'Fuarlar ve ödüller', iletisim: 'İletişim' }
export const pageName = (p: string) => (p === '/' ? 'Ana sayfa' : p)

// ---------- Rapor bağlamı ----------
type Ctx = { days: number; setDays: (d: number) => void; r: Row | null; err: string; reload: () => void; loading: boolean }
const RCtx = createContext<Ctx>({ days: 14, setDays: () => {}, r: null, err: '', reload: () => {}, loading: false })
export const useReport = () => useContext(RCtx)

export function ReportProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState(14)
  const [r, setR] = useState<Row | null>(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [n, setN] = useState(0)
  useEffect(() => {
    let off = false
    setLoading(true); setErr('')
    api('GET', `/api/site?report=1&days=${days}`).then((j) => { if (!off) setR(j) }).catch((e) => { if (!off) setErr(e.message) }).finally(() => { if (!off) setLoading(false) })
    return () => { off = true }
  }, [days, n])
  const reload = useCallback(() => setN((x) => x + 1), [])
  return <RCtx.Provider value={{ days, setDays, r, err, reload, loading }}>{children}</RCtx.Provider>
}

// ---------- Bileşenler ----------
export function Kpi({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'ok' | 'bad' }) {
  return (
    <div className="kpi">
      <span className="kpi-label">{label}</span>
      <div className="kpi-value" style={tone ? { color: tone === 'ok' ? 'var(--green)' : 'var(--red)' } : undefined}>{value}</div>
      <div className="kpi-sub" style={{ marginTop: 8 }}>{sub}</div>
    </div>
  )
}

export function Table({ cols, rows, empty = 'Henüz veri yok', max }: { cols: { h: string; k: string; r?: boolean; f?: (v: any, row: Row) => ReactNode; w?: number }[]; rows: Row[]; empty?: string; max?: number }) {
  if (!rows.length) return <div style={{ padding: '18px 20px', color: 'var(--tx3)' }}>{empty}</div>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>{cols.map((c) => <th key={c.k} style={{ textAlign: c.r ? 'right' : 'left', padding: '9px 14px', fontWeight: 600, color: 'var(--tx3)', fontSize: 11.5, borderBottom: '1px solid var(--bdr)', whiteSpace: 'nowrap', width: c.w }}>{c.h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.slice(0, max ?? rows.length).map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--bdr)' }}>
              {cols.map((c) => <td key={c.k} style={{ textAlign: c.r ? 'right' : 'left', padding: '9px 14px', verticalAlign: 'top', overflowWrap: 'anywhere' }}>{c.f ? c.f(row[c.k], row) : row[c.k]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Heatmap({ data }: { data: number[][] }) {
  const max = Math.max(1, ...data.flat())
  const D = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
  return (
    <div style={{ padding: '6px 16px 16px', overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '34px repeat(24,minmax(14px,1fr))', gap: 3, minWidth: 460 }}>
        <span />
        {Array.from({ length: 24 }, (_, h) => <span key={h} style={{ fontSize: 9.5, color: 'var(--tx3)', textAlign: 'center' }}>{h % 3 === 0 ? h : ''}</span>)}
        {data.map((row, d) => (
          <div key={d} style={{ display: 'contents' }}>
            <span style={{ fontSize: 11, color: 'var(--tx3)', alignSelf: 'center' }}>{D[d]}</span>
            {row.map((v, h) => <span key={h} title={`${D[d]} ${h}:00 — ${v} görüntüleme`} style={{ height: 20, borderRadius: 4, background: v ? `color-mix(in srgb, var(--ac) ${Math.max(14, (v / max) * 100)}%, var(--s3))` : 'var(--s3)' }} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = Math.max(1, steps[0]?.value ?? 1)
  return (
    <div style={{ padding: '10px 20px 18px', display: 'grid', gap: 10 }}>
      {steps.map((s, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><span>{s.label}</span><b>{fmtNum(s.value)} <span style={{ color: 'var(--tx3)', fontWeight: 500 }}>({fmtPct(+((s.value / top) * 100).toFixed(1))})</span></b></div>
          <div style={{ height: 22, background: 'var(--s3)', borderRadius: 6 }}><div style={{ width: `${Math.max(2, (s.value / top) * 100)}%`, height: '100%', background: 'var(--ac)', borderRadius: 6, opacity: 1 - i * 0.18 }} /></div>
        </div>
      ))}
    </div>
  )
}

export function Empty({ r }: { r: Row | null }) {
  if (r && !r.hasSessions && r.totals.views === 0) return <div className="card" style={{ padding: '14px 18px', marginBottom: 16, borderColor: 'var(--amber)', background: 'var(--amber2)' }}>Henüz ziyaret verisi yok. Site ziyaret aldıkça bu sayfalar dolar. Yönetim paneline giriş yapmış tarayıcılar sayılmaz.</div>
  if (r && !r.hasSessions) return <div className="card" style={{ padding: '14px 18px', marginBottom: 16, borderColor: 'var(--amber)', background: 'var(--amber2)' }}>Oturum ve kampanya ölçümü yeni açıldı. Eski kayıtlarda oturum, süre ve kampanya bilgisi yok; yeni ziyaretlerle birlikte dolacak.</div>
  return null
}

export function downloadCsv(name: string, head: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = '﻿' + [head, ...rows].map((r) => r.map(esc).join(';')).join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
