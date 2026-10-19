'use client'
import { createContext, useCallback, useContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react'

export type Row = Record<string, any>
export const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'it'] as const
export const LANG_NAMES: Record<string, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch', fr: 'Français', es: 'Español', it: 'Italiano' }

export async function api(method: 'GET' | 'POST', url: string, body?: any) {
  const r = await fetch(url, { method, headers: body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || r.statusText)
  return j
}
export const getRows = async (table: string): Promise<Row[]> => (await api('GET', `/api/site?table=${table}`)).rows

/** Görsel yolu -> önizleme adresi ('/images/x' site dosyası, 'storage:x' Supabase kovası). */
export function preview(src?: string | null) {
  if (!src) return ''
  if (src.startsWith('storage:')) return `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/site-media/${src.slice(8)}`
  if (src.startsWith('/')) return `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}${src}`
  return src
}

// ---------- Toast ----------
const ToastCtx = createContext<(m: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [m, setM] = useState('')
  const say = useCallback((x: string) => { setM(x); setTimeout(() => setM(''), 3800) }, [])
  return (
    <ToastCtx.Provider value={say}>
      {children}
      {m && <div role="status" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--s5)', color: 'var(--tx)', padding: '10px 18px', borderRadius: 10, zIndex: 80, boxShadow: '0 8px 30px rgba(0,0,0,.4)' }}>{m}</div>}
    </ToastCtx.Provider>
  )
}

// ---------- Modal ----------
export function Modal({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [onClose])
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.62)', display: 'grid', placeItems: 'center', zIndex: 50 }} onMouseDown={onClose}>
      <div className="card" role="dialog" aria-modal="true" aria-label={title} style={{ width: `min(${wide ? 860 : 620}px,94vw)`, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="card-h"><span className="card-title">{title}</span><button className="btn-ghost" onClick={onClose} aria-label="Kapat">✕</button></div>
        <div style={{ padding: 20, overflow: 'auto' }}>{children}</div>
        {footer && <div style={{ padding: '12px 20px', borderTop: '1px solid var(--bdr)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  )
}

export const Label = ({ children }: { children: ReactNode }) => <div style={{ fontSize: 12, color: 'var(--tx3)', margin: '12px 0 5px' }}>{children}</div>
export const Pill = ({ children, tone = 'mute' }: { children: ReactNode; tone?: 'ok' | 'warn' | 'bad' | 'mute' | 'ac' }) => {
  const c = { ok: ['var(--green)', 'var(--green2)'], warn: ['var(--amber)', 'var(--amber2)'], bad: ['var(--red)', 'var(--red2)'], mute: ['var(--tx2)', 'var(--s3)'], ac: ['var(--ac)', 'var(--ac2)'] }[tone]
  return <span style={{ color: c[0], background: c[1], fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap' }}>{children}</span>
}

// ---------- Görsel alanı ----------
export function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const say = useToast(); const [busy, setBusy] = useState(false); const [pick, setPick] = useState(false)
  async function up(f: File) {
    setBusy(true)
    try { const fd = new FormData(); fd.append('file', f); onChange((await api('POST', '/api/site', fd)).path) } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 10, background: 'var(--s3) center/cover', backgroundImage: value ? `url(${preview(value)})` : undefined, flexShrink: 0, border: '1px solid var(--bdr)' }} />
      <input className="inp" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="/images/… veya storage:…" />
      <label className="btn-ghost" style={{ cursor: 'pointer' }}>{busy ? '…' : 'Yükle'}<input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && up(e.target.files[0])} /></label>
      <button type="button" className="btn-ghost" onClick={() => setPick(true)}>Kütüphane</button>
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(p) => { onChange(p); setPick(false) }} />}
    </div>
  )
}

export function MediaPicker({ onPick, onClose }: { onPick: (p: string) => void; onClose: () => void }) {
  const [files, setFiles] = useState<{ name: string; path: string }[]>([])
  useEffect(() => { api('GET', '/api/site?media=1').then((j) => setFiles(j.files)).catch(() => {}) }, [])
  return (
    <Modal title="Medya kütüphanesi" onClose={onClose} wide>
      {!files.length && <div style={{ color: 'var(--tx3)' }}>Henüz yüklenmiş görsel yok.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
        {files.map((f) => (
          <button key={f.name} className="card" style={{ padding: 0, cursor: 'pointer', textAlign: 'left' }} onClick={() => onPick(f.path)}>
            <div style={{ height: 100, background: `var(--s3) center/cover url(${preview(f.path)})` }} />
            <div style={{ padding: 6, fontSize: 11, color: 'var(--tx3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
          </button>
        ))}
      </div>
    </Modal>
  )
}

/** Metin anahtarı seçici + Türkçe önizleme. */
export function KeyField({ value, onChange, texts, ns = 't' }: { value: string; onChange: (v: string) => void; texts: Row[]; ns?: string }) {
  const id = `keys-${ns}`
  const hit = texts.find((t) => t.ns === ns && t.key === value)
  return (
    <div>
      <input className="inp" list={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      <datalist id={id}>{texts.filter((t) => t.ns === ns).map((t) => <option key={t.key} value={t.key}>{t.value?.tr}</option>)}</datalist>
      {value && <div style={{ fontSize: 12, marginTop: 4, color: hit ? 'var(--tx3)' : 'var(--red)' }}>{hit ? `“${hit.value?.tr ?? hit.value?.en ?? ''}”` : 'Bu anahtar yok. Önce Metinler sayfasından ekleyin.'}</div>}
    </div>
  )
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1 }}><h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>{sub && <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginTop: 2 }}>{sub}</div>}</div>
      {action}
    </div>
  )
}
export const grid = (min = 240): CSSProperties => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(min(${min}px,100%),1fr))`, gap: 14 })
