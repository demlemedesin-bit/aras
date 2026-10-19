'use client'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_CATEGORIES, catName, type Cat } from '@/lib/categories'
import { ImageField, KeyField, Label, Modal, PageHead, Pill, api, getRows, grid, preview, useToast, type Row } from './ui'

export type Field = { k: string; l: string; t?: 'text' | 'num' | 'bool' | 'img' | 'list' | 'world' | 'key' | 'cat'; ns?: string; help?: string }
export type Config = {
  table: string; title: string; sub: string; pk: string; singular: string
  fields: Field[]; defaults: Row; imgKey?: string
  head: (r: Row, tr: (k: string) => string) => string
  meta?: (r: Row, tr: (k: string) => string) => ReactNode
  filterKey?: string // örn. galeri: group_id
  autoId?: (r: Row) => string // yeni kayıtta kimliği otomatik üret
  extra?: ReactNode // sayfa üstüne ek araçlar (ör. toplu yükleme)
}

export default function ListManager({ cfg }: { cfg: Config }) {
  const say = useToast()
  const [rows, setRows] = useState<Row[]>([])
  const [texts, setTexts] = useState<Row[]>([])
  const [cats, setCats] = useState<Cat[]>(DEFAULT_CATEGORIES)
  const [edit, setEdit] = useState<Row | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [busy, setBusy] = useState(false)
  const [q, setQ] = useState('')
  const [f, setF] = useState('')

  const load = useCallback(async () => {
    try { const [r, t, st] = await Promise.all([getRows(cfg.table), getRows('site_texts'), getRows('site_settings')]); setRows(r); setTexts(t); const c = st.find((x) => x.key === 'categories')?.value; if (Array.isArray(c) && c.length) setCats(c) } catch (e: any) { say(e.message) }
  }, [cfg.table, say])
  useEffect(() => { load() }, [load])

  const tr = useCallback((k: string) => texts.find((t) => t.ns === 't' && t.key === k)?.value?.tr ?? k, [texts])
  const filters = useMemo(() => (cfg.filterKey ? Array.from(new Set(rows.map((r) => r[cfg.filterKey!]))) : []), [rows, cfg.filterKey])
  const shown = rows.filter((r) => (!f || r[cfg.filterKey!] === f) && (!q || (cfg.head(r, tr) + JSON.stringify(r)).toLowerCase().includes(q.toLowerCase())))

  async function save(row: Row) {
    setBusy(true)
    try {
      const out = { ...row }
      for (const fl of cfg.fields) if (fl.t === 'num') out[fl.k] = Number(out[fl.k] ?? 0)
      if (isNew && cfg.pk !== 'id') delete out.id
      if (isNew && cfg.autoId && !out.id) out.id = cfg.autoId(out)
      if (cfg.pk === 'id' && !out.id) throw new Error('Kimlik boş olamaz')
      const j = await api('POST', '/api/site', { action: 'upsert', table: cfg.table, row: out })
      say(j.revalidated === false ? 'Kaydedildi (site 5 dk içinde güncellenir)' : 'Kaydedildi, site güncellendi')
      setEdit(null); await load()
    } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }
  async function quick(row: Row, patch: Row) {
    try { await api('POST', '/api/site', { action: 'upsert', table: cfg.table, row: { ...row, ...patch } }); await load() } catch (e: any) { say(e.message) }
  }
  async function del(r: Row) {
    if (!confirm(`${cfg.head(r, tr)} silinsin mi?`)) return
    try { await api('POST', '/api/site', { action: 'delete', table: cfg.table, row: r }); say('Silindi'); await load() } catch (e: any) { say(e.message) }
  }
  // Sıralama: komşuyla "sort" değerini değiştir
  async function move(r: Row, dir: -1 | 1) {
    const list = [...rows].sort((a, b) => a.sort - b.sort)
    const i = list.findIndex((x) => x[cfg.pk] === r[cfg.pk]); const o = list[i + dir]
    if (!o) return
    const a = i + dir, b = i
    // eşit değerler olsa bile çalışsın diye indekse göre yeniden numarala
    list.splice(i, 1); list.splice(a, 0, r)
    try { await Promise.all(list.map((x, n) => (x.sort !== n ? api('POST', '/api/site', { action: 'upsert', table: cfg.table, row: { ...x, sort: n } }) : null))); await load() } catch (e: any) { say(e.message) }
    void b
  }

  const set = (k: string, v: any) => setEdit((e) => ({ ...e!, [k]: v }))
  const input = (fl: Field) => {
    const v = edit![fl.k]
    const lock = fl.k === 'id' && !isNew
    if (fl.t === 'bool') return <label key={fl.k} style={{ display: 'block', marginTop: 12 }}><input type="checkbox" checked={!!v} onChange={(e) => set(fl.k, e.target.checked)} /> {fl.l}</label>
    return (
      <div key={fl.k}>
        <Label>{fl.l}</Label>
        {fl.t === 'world' ? <select className="inp" value={v} onChange={(e) => set(fl.k, e.target.value)}><option value="home">Ev</option><option value="garden">Bahçe</option></select>
          : fl.t === 'num' ? <input className="inp" type="number" value={v ?? 0} onChange={(e) => set(fl.k, e.target.value)} />
          : fl.t === 'list' ? <input className="inp" value={(v ?? []).join(', ')} onChange={(e) => set(fl.k, e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
          : fl.t === 'cat' ? <select className="inp" value={v ?? ''} onChange={(e) => { const id = e.target.value; const m = cats.find((c) => c.id === id || c.subs.some((x) => x.id === id)); setEdit((ed) => ({ ...ed!, [fl.k]: id, ...(m ? { world: m.world } : {}) })) }}>
              <option value="">Seçin</option>
              {cats.map((m) => <optgroup key={m.id} label={catName(m.name, 'tr')}><option value={m.id}>{catName(m.name, 'tr')} (genel)</option>{m.subs.map((x) => <option key={x.id} value={x.id}>{catName(m.name, 'tr')} › {catName(x.name, 'tr')}</option>)}</optgroup>)}
            </select>
          : fl.t === 'img' ? <ImageField value={v ?? ''} onChange={(x) => set(fl.k, x)} />
          : fl.t === 'key' ? <KeyField value={v ?? ''} onChange={(x) => set(fl.k, x)} texts={texts} ns={fl.ns} />
          : <input className="inp" value={v ?? ''} disabled={lock} onChange={(e) => set(fl.k, e.target.value)} />}
        {fl.help && <div style={{ fontSize: 11.5, color: 'var(--tx3)', marginTop: 4 }}>{fl.help}</div>}
      </div>
    )
  }

  return (
    <>
      <PageHead title={cfg.title} sub={cfg.sub} action={<button className="btn" onClick={() => { setIsNew(true); setEdit({ ...cfg.defaults, sort: rows.length }) }}>+ Yeni {cfg.singular}</button>} />
      {cfg.extra}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input className="inp" style={{ maxWidth: 320 }} placeholder="Ara…" value={q} onChange={(e) => setQ(e.target.value)} />
        {filters.length > 1 && <select className="inp" style={{ maxWidth: 200 }} value={f} onChange={(e) => setF(e.target.value)}><option value="">Tümü ({rows.length})</option>{filters.map((x) => <option key={x}>{x}</option>)}</select>}
      </div>
      <div style={grid(cfg.imgKey ? 220 : 300)}>
        {shown.map((r) => (
          <div key={r[cfg.pk]} className="card" style={{ opacity: r.active === false ? 0.55 : 1 }}>
            {cfg.imgKey && <div style={{ height: 150, background: `var(--s3) center/cover url(${preview(r[cfg.imgKey])})`, backgroundPosition: r.pos || 'center' }} />}
            <div style={{ padding: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{cfg.head(r, tr)}</div>
              <div style={{ fontSize: 12, color: 'var(--tx3)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {cfg.meta?.(r, tr)}{r.active === false && <Pill tone="warn">Gizli</Pill>}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <button className="btn-ghost" onClick={() => { setIsNew(false); setEdit(structuredClone(r)) }}>Düzenle</button>
                <button className="btn-ghost" title="Yukarı" aria-label="Öne al" onClick={() => move(r, -1)}>↑</button>
                <button className="btn-ghost" title="Aşağı" aria-label="Geri al" onClick={() => move(r, 1)}>↓</button>
                <button className="btn-ghost" onClick={() => quick(r, { active: r.active === false })}>{r.active === false ? 'Yayınla' : 'Gizle'}</button>
                <button className="btn-danger" onClick={() => del(r)}>Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!shown.length && <div className="card" style={{ padding: 24, color: 'var(--tx3)' }}>Kayıt yok</div>}
      {edit && (
        <Modal title={isNew ? `Yeni ${cfg.singular}` : cfg.head(edit, tr)} onClose={() => setEdit(null)}
          footer={<><button className="btn-ghost" onClick={() => setEdit(null)}>Vazgeç</button><button className="btn" disabled={busy} onClick={() => save(edit)}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button></>}>
          {cfg.fields.map(input)}
        </Modal>
      )}
    </>
  )
}
