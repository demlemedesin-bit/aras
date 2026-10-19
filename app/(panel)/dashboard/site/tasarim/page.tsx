'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, GripVertical, Layers, Monitor, MousePointerClick, Palette, Redo2, RotateCcw, Smartphone, Tablet, Trash2, Type, Undo2 } from 'lucide-react'
import { LANGS, LANG_NAMES, api, getRows, useToast, type Row } from '@panel/components/site/ui'
import { useSetting } from '@panel/components/site/useSetting'
import { ColorPicker } from '@panel/components/site/ColorPicker'
import { COLOR_GROUPS, DEFAULT_LAYOUT, FONTS, PRESETS, SECTION_DEFS, THEME_DEFAULT, fontHref, normLayout, themeCssFull, type ColorKey, type Override, type Theme } from '@/lib/site-config'
import i18n from '@/lib/i18n-data.json'

const PAGES: [string, string][] = [['/', 'Ana sayfa'], ['/kariyer', 'Kariyer'], ['/sss', 'SSS'], ['/gizlilik', 'Gizlilik'], ['/cerez-politikasi', 'Çerez'], ['/kullanim-kosullari', 'Koşullar']]
const DEV: Record<string, number | string> = { d: '100%', t: 820, m: 390 }
const PAIR: Partial<Record<ColorKey, ColorKey>> = { k: 'w', ash: 'w', bt: 'btt', btt: 'bt', dk: 'dkt', dkt: 'dk', hd: 'k', w: 'k' }
const norm = (r: any): Theme => ({ ...THEME_DEFAULT, ...r, colors: { ...THEME_DEFAULT.colors, ...(r?.colors ?? {}) }, overrides: r?.overrides ?? [], layout: normLayout(r?.layout) })
const rgbToHex = (c: string) => { const m = c.match(/\d+(\.\d+)?/g); if (!m || m.length < 3) return ''; if (m[3] !== undefined && +m[3] === 0) return ''; return '#' + m.slice(0, 3).map((x) => Math.round(+x).toString(16).padStart(2, '0')).join('') }
const px = (v: string) => (v?.endsWith('px') ? String(Math.round(parseFloat(v))) : '')
const flat = (t: string) => t.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

type Pick = { similar: string; exact: string; label: string; text: string; lang: string; section: string; computed: Record<string, string> }
type Tab = 'bolum' | 'tema' | 'renk' | 'yazi' | 'oge'
const dk = (r: Row) => `${r.ns}\u0000${r.key}`

/** Koddaki varsayılan metinler + panelde kayıtlı metinler. */
function baseTexts(): Row[] {
  const out: Row[] = []
  const d = i18n as any
  for (const ns of ['t', 'ui', 'auth'] as const) {
    const m: Record<string, Record<string, string>> = {}
    for (const l of LANGS) for (const [k, v] of Object.entries(d[ns]?.[l] ?? {})) (m[k] ??= {})[l] = v as string
    for (const [key, value] of Object.entries(m)) out.push({ ns, key, value })
  }
  return out
}

export default function Page() {
  const say = useToast()
  const { val: th, setVal, saved, busy, save, loaded } = useSetting<Theme>('theme', THEME_DEFAULT, norm)
  const [path, setPath] = useState('/')
  const [dev, setDev] = useState<'d' | 't' | 'm'>('d')
  const [tab, setTab] = useState<Tab>('bolum')
  const [edit, setEdit] = useState(true)
  const [pick, setPick] = useState<Pick | null>(null)
  const [scope, setScope] = useState<'similar' | 'exact'>('similar')
  const ref = useRef<HTMLIFrameElement>(null)
  const ready = useRef(false)
  const layout = useMemo(() => normLayout(th.layout), [th.layout])

  // ---------- geri al / ileri al ----------
  const [past, setPast] = useState<Theme[]>([])
  const [future, setFuture] = useState<Theme[]>([])
  const lastTs = useRef(0)
  const cur = useRef(th); cur.current = th
  const clean = useRef('')
  useEffect(() => { if (loaded) clean.current = JSON.stringify(cur.current) }, [loaded])
  const commit = useCallback((next: Theme) => {
    const now = Date.now()
    if (now - lastTs.current > 600) setPast((p) => [...p.slice(-99), cur.current])
    lastTs.current = now
    setFuture([])
    setVal(next)
  }, [setVal])
  const undo = useCallback(() => { setPast((p) => { if (!p.length) return p; setFuture((f) => [cur.current, ...f]); setVal(p[p.length - 1]); lastTs.current = 0; return p.slice(0, -1) }) }, [setVal])
  const redo = useCallback(() => { setFuture((f) => { if (!f.length) return f; setPast((p) => [...p, cur.current]); setVal(f[0]); lastTs.current = 0; return f.slice(1) }) }, [setVal])

  // ---------- metinler ----------
  const [rows, setRows] = useState<Row[]>(() => baseTexts())
  const [drafts, setDrafts] = useState<Record<string, Row>>({})
  useEffect(() => {
    getRows('site_texts').then((db) => {
      const m = new Map(baseTexts().map((r) => [dk(r), r]))
      for (const r of db) m.set(dk(r), { ns: r.ns, key: r.key, value: { ...(m.get(dk(r))?.value ?? {}), ...(r.value ?? {}) } })
      setRows([...m.values()])
    }).catch(() => {})
  }, [])
  const valueOf = useCallback((r: Row, l: string) => drafts[dk(r)]?.value?.[l] ?? r.value?.[l] ?? '', [drafts])
  const matches = useCallback((text: string, lang: string) => rows.filter((r) => flat(valueOf(r, lang)) === text), [rows, valueOf])
  const setText = useCallback((r: Row, l: string, v: string) => setDrafts((d) => ({ ...d, [dk(r)]: { ns: r.ns, key: r.key, value: { ...(d[dk(r)]?.value ?? r.value ?? {}), [l]: v } } })), [])

  const send = useCallback((m: any) => ref.current?.contentWindow?.postMessage(m, location.origin), [])
  const push = useCallback(() => { send({ type: 'aras-theme', css: themeCssFull(th), font: fontHref(th) }) }, [th, send])
  useEffect(() => { if (ready.current) push() }, [push])
  useEffect(() => { send({ type: 'aras-edit', on: edit }) }, [edit, send, path])
  const layoutKey = JSON.stringify(layout)
  useEffect(() => { if (ready.current && path === '/') send({ type: 'aras-layout', ...layout }) }, [layoutKey, path]) // eslint-disable-line react-hooks/exhaustive-deps
  const shown = useRef('')

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== ref.current?.contentWindow) return
      const m = e.data
      if (m?.type === 'aras-ready') { ready.current = true; push(); send({ type: 'aras-edit', on: edit }); if (path === '/') send({ type: 'aras-layout', ...layout }) }
      else if (m?.type === 'aras-pick') { setPick(m); shown.current = m.text; setTab('oge') }
      else if (m?.type === 'aras-order') { const next = normLayout({ order: m.order, hidden: m.hidden }); if (JSON.stringify(next) !== layoutKey) commit({ ...cur.current, layout: next }) }
      else if (m?.type === 'aras-textedit') {
        const hit = matches(m.before, m.lang)
        if (!hit.length) { say('Bu yazı Metinler listesinde bulunamadı (ürün adı, tarih gibi dinamik bir içerik olabilir).'); return }
        setDrafts((d) => { const n = { ...d }; for (const r of hit) n[dk(r)] = { ns: r.ns, key: r.key, value: { ...(n[dk(r)]?.value ?? r.value ?? {}), [m.lang]: m.after } }; return n })
        setPick((p) => (p ? { ...p, text: m.after } : p)); shown.current = m.after
        say(`${hit.length} metin güncellendi. Yayına al'a basınca siteye geçer.`)
      }
    }
    addEventListener('message', on); return () => removeEventListener('message', on)
  })

  // ---------- kısayollar ----------
  const publishRef = useRef<() => void>(() => {})
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      const t = e.target as HTMLElement
      if (/INPUT|TEXTAREA|SELECT/.test(t.tagName) && e.key.toLowerCase() !== 's') return
      if (e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo() }
      else if (e.key.toLowerCase() === 'y') { e.preventDefault(); redo() }
      else if (e.key.toLowerCase() === 's') { e.preventDefault(); publishRef.current() }
    }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [undo, redo])

  // ---------- türetilmiş ----------
  const draftCount = Object.keys(drafts).length
  const dirty = loaded && (JSON.stringify(th) !== clean.current || draftCount > 0)
  const sel = pick ? (scope === 'similar' ? pick.similar : pick.exact) : ''
  const ovs = th.overrides ?? []
  const curOv = ovs.find((o) => o.sel === sel)
  const setCss = (prop: string, v: string) => {
    if (!pick) return
    const css = { ...(curOv?.css ?? {}) }
    if (v === '' || v == null) delete css[prop]; else css[prop] = v
    const rest = ovs.filter((o) => o.sel !== sel)
    commit({ ...th, overrides: Object.keys(css).length ? [...rest, { id: curOv?.id ?? `o${Date.now().toString(36)}`, sel, note: pick.label, css }] : rest })
  }
  const g = (prop: string) => curOv?.css[prop] ?? ''
  const dis = (prop: string, fallback: string) => g(prop) || rgbToHex(pick?.computed[prop] ?? '') || fallback
  const col = (k: ColorKey, v: string) => commit({ ...th, colors: { ...th.colors, [k]: v } })
  const applyPreset = (t: Partial<Theme>) => commit({ ...th, ...t, colors: { ...THEME_DEFAULT.colors, ...(t.colors ?? {}) }, radius: t.radius ?? 'pill' })
  const candidates = pick ? matches(pick.text, pick.lang) : []

  async function publish() {
    try {
      await save(th)
      const list = Object.values(drafts)
      for (const r of list) await api('POST', '/api/site', { action: 'upsert', table: 'site_texts', row: { ns: r.ns, key: r.key, value: r.value } })
      if (list.length) { setRows((rs) => rs.map((r) => (drafts[dk(r)] ? { ...r, value: drafts[dk(r)].value } : r))); setDrafts({}) }
      clean.current = JSON.stringify(th)
      say(`Yayınlandı${list.length ? ` (${list.length} metin dahil)` : ''}.`)
    } catch (e: any) { say(e.message) }
  }
  publishRef.current = publish

  // ---------- bölüm sürükle-bırak ----------
  const dragId = useRef<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const setOrder = (order: string[], hidden = layout.hidden) => commit({ ...th, layout: { order, hidden } })
  const drop = (target: string) => {
    const id = dragId.current; dragId.current = null; setOver(null)
    if (!id || id === target) return
    const o = layout.order.filter((x) => x !== id); o.splice(o.indexOf(target), 0, id); setOrder(o)
  }

  const Tb = ({ k, n, I }: { k: Tab; n: string; I: any }) => (
    <button onClick={() => setTab(k)} title={n} style={{ flex: 1, display: 'grid', placeItems: 'center', gap: 2, padding: '9px 2px', border: 0, background: tab === k ? 'var(--s3)' : 'transparent', color: tab === k ? 'var(--tx)' : 'var(--tx3)', borderBottom: `2px solid ${tab === k ? 'var(--ac)' : 'transparent'}`, cursor: 'pointer', fontSize: 11 }}><I size={16} />{n}</button>
  )
  const Row_ = ({ n, children }: { n: string; children: React.ReactNode }) => <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, minHeight: 34 }}><span style={{ flex: 1 }}>{n}</span>{children}</label>
  const IconBtn = ({ on, disabled, title, children }: { on: () => void; disabled?: boolean; title: string; children: React.ReactNode }) => <button className="btn-ghost" title={title} aria-label={title} disabled={disabled} onClick={on} style={{ padding: '6px 9px', opacity: disabled ? 0.4 : 1 }}>{children}</button>

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 45, background: 'var(--bg, #0e0f11)', display: 'grid', gridTemplateRows: '52px 1fr', gridTemplateColumns: 'minmax(320px,372px) 1fr' }}>
      {/* ---- üst çubuk ---- */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderBottom: '1px solid var(--bdr)', background: 'var(--s1, var(--s2))' }}>
        <Link href="/dashboard" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}><ArrowLeft size={15} /> Panel</Link>
        <b style={{ marginLeft: 4 }}>Site düzenleyici</b>
        <div style={{ display: 'flex', gap: 4, marginLeft: 14, overflowX: 'auto' }}>
          {PAGES.map(([p, n]) => <button key={p} className={path === p ? 'btn' : 'btn-ghost'} style={{ padding: '6px 11px', whiteSpace: 'nowrap' }} onClick={() => { setPath(p); setPick(null) }}>{n}</button>)}
        </div>
        <span style={{ flex: 1 }} />
        {dirty && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--amber, #f5a524)' }}><i style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} /> Yayınlanmamış değişiklik</span>}
        <div style={{ display: 'flex', gap: 2 }}>{([['d', Monitor], ['t', Tablet], ['m', Smartphone]] as const).map(([k, I]) => <IconBtn key={k} title={{ d: 'Masaüstü', t: 'Tablet', m: 'Mobil' }[k]} on={() => setDev(k)}><span style={{ color: dev === k ? 'var(--ac)' : undefined, display: 'flex' }}><I size={16} /></span></IconBtn>)}</div>
        <IconBtn title="Geri al (Ctrl+Z)" on={undo} disabled={!past.length}><Undo2 size={16} /></IconBtn>
        <IconBtn title="İleri al (Ctrl+Shift+Z)" on={redo} disabled={!future.length}><Redo2 size={16} /></IconBtn>
        <button className={edit ? 'btn' : 'btn-ghost'} onClick={() => setEdit((x) => !x)} title="Açıkken sitede tıklayıp düzenleyin; kapalıyken site normal çalışır"><MousePointerClick size={15} /> {edit ? 'Düzenleme açık' : 'Önizleme'}</button>
        <button className="btn" disabled={busy || !dirty} onClick={publish} title="Ctrl+S">{busy ? 'Yayınlanıyor…' : 'Yayına al'}</button>
      </div>

      {/* ---- sol panel ---- */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: '1px solid var(--bdr)', background: 'var(--s2)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--bdr)' }}>
          <Tb k="bolum" n="Bölümler" I={Layers} /><Tb k="tema" n="Tema" I={Palette} /><Tb k="renk" n="Renkler" I={Palette} /><Tb k="yazi" n="Yazı" I={Type} /><Tb k="oge" n="Seçili" I={MousePointerClick} />
        </div>
        <div style={{ overflowY: 'auto', padding: 12, display: 'grid', gap: 12, alignContent: 'start' }}>
          {tab === 'bolum' && (
            <div className="card" style={{ padding: 12, display: 'grid', gap: 6 }}>
              <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginBottom: 4 }}>Ana sayfa bölümlerini sürükleyip bırakarak sıralayın, göz simgesiyle gizleyin. Önizlemede bir bölümün üzerine gelince çıkan çubuktan da taşıyabilirsiniz.</div>
              {layout.order.map((id) => {
                const n = SECTION_DEFS.find((x) => x.id === id)?.n ?? id
                const off = layout.hidden.includes(id)
                return (
                  <div key={id} draggable onDragStart={() => { dragId.current = id }} onDragOver={(e) => { e.preventDefault(); setOver(id) }} onDragLeave={() => setOver(null)} onDrop={() => drop(id)} onDragEnd={() => { dragId.current = null; setOver(null) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 10, background: 'var(--s3)', border: '1px solid var(--bdr)', borderTop: over === id ? '3px solid var(--ac)' : '1px solid var(--bdr)', opacity: off ? 0.5 : 1, cursor: 'grab' }}>
                    <GripVertical size={16} style={{ color: 'var(--tx3)' }} />
                    <span style={{ flex: 1, fontSize: 13.5 }}>{n}</span>
                    <button className="btn-ghost" aria-label={off ? 'Göster' : 'Gizle'} title={off ? 'Göster' : 'Gizle'} onClick={() => setOrder(layout.order, off ? layout.hidden.filter((x) => x !== id) : [...layout.hidden, id])} style={{ padding: '4px 8px' }}>{off ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                )
              })}
              <button className="btn-ghost" onClick={() => commit({ ...th, layout: DEFAULT_LAYOUT })}><RotateCcw size={14} /> Sıralamayı sıfırla</button>
            </div>
          )}

          {tab === 'tema' && (
            <div className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
              <div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>Bir tema seçince renkler ve köşeler değişir. Sonra Renkler sekmesinden dilediğiniz rengi ayrıca değiştirebilirsiniz.</div>
              {PRESETS.map((p) => (
                <button key={p.n} className="btn-ghost" style={{ justifyContent: 'flex-start', gap: 10, padding: 10 }} onClick={() => applyPreset(p.t)}>
                  <span style={{ display: 'flex' }}>{(['w', 'k', 'gr', 'bt', 'dk'] as ColorKey[]).map((k) => <i key={k} style={{ width: 20, height: 20, borderRadius: '50%', marginRight: -5, background: p.t.colors?.[k] ?? THEME_DEFAULT.colors[k], border: '1px solid var(--bdr)' }} />)}</span>
                  <span style={{ marginLeft: 8 }}>{p.n}</span>
                </button>
              ))}
              <button className="btn-ghost" onClick={() => confirm('Tüm tasarım ayarları (özel öğe düzenlemeleri ve sıralama dahil) varsayılana dönsün mü?') && commit(structuredClone(THEME_DEFAULT))}><RotateCcw size={14} /> Her şeyi varsayılana döndür</button>
            </div>
          )}

          {tab === 'renk' && COLOR_GROUPS.map((gr) => (
            <div key={gr.n} className="card" style={{ padding: 12 }}>
              <b style={{ fontSize: 13 }}>{gr.n}</b>
              {gr.keys.map((c) => (
                <div key={c.k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <ColorPicker value={th.colors[c.k] ?? THEME_DEFAULT.colors[c.k]!} onChange={(v) => col(c.k, v)} against={PAIR[c.k] ? (th.colors[PAIR[c.k]!] ?? THEME_DEFAULT.colors[PAIR[c.k]!]) : undefined} title={c.n} />
                  <div style={{ flex: 1, lineHeight: 1.25 }}><div style={{ fontSize: 13 }}>{c.n}</div><div style={{ fontSize: 11.5, color: 'var(--tx3)' }}>{c.d}</div></div>
                  <code style={{ fontSize: 11.5, color: 'var(--tx3)' }}>{th.colors[c.k]}</code>
                </div>
              ))}
            </div>
          ))}

          {tab === 'yazi' && (
            <div className="card" style={{ padding: 12, display: 'grid', gap: 12 }}>
              <div><div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 4 }}>Gövde yazı tipi</div><select className="inp" value={th.font} onChange={(e) => commit({ ...th, font: e.target.value })}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select></div>
              <div><div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 4 }}>Başlık yazı tipi</div><select className="inp" value={th.headFont} onChange={(e) => commit({ ...th, headFont: e.target.value })}><option value="">Gövde ile aynı</option>{FONTS.map((f) => <option key={f}>{f}</option>)}</select></div>
              <div><div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 4 }}>Temel yazı boyutu: {th.base}px</div><input type="range" min={14} max={20} value={th.base} onChange={(e) => commit({ ...th, base: +e.target.value })} style={{ width: '100%' }} /></div>
              <div><div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 6 }}>Köşeler (düğme, etiket, kart)</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{([['pill', 'Tam yuvarlak'], ['soft', 'Yumuşak'], ['sharp', 'Keskin']] as const).map(([k, n]) => <button key={k} className={th.radius === k ? 'btn' : 'btn-ghost'} onClick={() => commit({ ...th, radius: k })}>{n}</button>)}</div></div>
            </div>
          )}

          {tab === 'oge' && (
            <>
              {!pick ? (
                <div className="card" style={{ padding: 14, color: 'var(--tx3)', fontSize: 13, lineHeight: 1.5 }}>
                  Sağdaki sitede bir yere <b>tıklayın</b>: rengini, boyutunu ve yazısını burada düzenlersiniz.<br />
                  Bir yazının üzerine <b>çift tıklarsanız</b> orada yazıyı doğrudan değiştirirsiniz (Enter kaydeder, Esc vazgeçer).
                </div>
              ) : (
                <>
                  <div className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
                    <b style={{ fontSize: 13 }}>Yazı</b>
                    {candidates.length ? (
                      <>
                        {candidates.length > 1 && <div style={{ fontSize: 12, color: 'var(--tx3)' }}>Bu yazı {candidates.length} metinde aynı; hepsi birlikte değişir: {candidates.map((r) => r.key).join(', ')}</div>}
                        {LANGS.map((l) => (
                          <label key={l} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--tx3)' }}>
                            {LANG_NAMES[l]}
                            <textarea className="inp" rows={flat(valueOf(candidates[0], l)).length > 46 ? 3 : 1} style={{ resize: 'vertical' }} value={valueOf(candidates[0], l)}
                              onChange={(e) => {
                                const v = e.target.value
                                for (const r of candidates) setText(r, l, v)
                                if (l === pick.lang) { send({ type: 'aras-settext', before: shown.current, after: flat(v) }); shown.current = flat(v) }
                              }} />
                          </label>
                        ))}
                      </>
                    ) : (
                      <div style={{ fontSize: 12.5, color: 'var(--tx3)' }}>Bu yazı Metinler listesinde yok (ürün adı, tarih, haber gibi dinamik içerik olabilir). Görünüm ayarlarını aşağıdan değiştirebilirsiniz.</div>
                    )}
                  </div>
                  <div className="card" style={{ padding: 12, display: 'grid', gap: 6 }}>
                    <b style={{ fontSize: 13 }}>Görünüm · {pick.label}</b>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className={scope === 'similar' ? 'btn' : 'btn-ghost'} onClick={() => setScope('similar')}>Benzerlerin hepsi</button>
                      <button className={scope === 'exact' ? 'btn' : 'btn-ghost'} onClick={() => setScope('exact')}>Yalnızca bu</button>
                    </div>
                    <Row_ n="Yazı rengi"><ColorPicker value={dis('color', '#000000')} onChange={(v) => setCss('color', v)} title="Yazı rengi" /></Row_>
                    <Row_ n="Zemin rengi"><ColorPicker value={dis('background-color', '#ffffff')} onChange={(v) => setCss('background-color', v)} title="Zemin rengi" /></Row_>
                    <Row_ n="Yazı boyutu (px)"><input className="inp" style={{ width: 90 }} type="number" min={8} max={200} placeholder={px(pick.computed['font-size'])} value={g('font-size').replace('px', '')} onChange={(e) => setCss('font-size', e.target.value ? `${e.target.value}px` : '')} /></Row_>
                    <Row_ n="Kalınlık"><select className="inp" style={{ width: 120 }} value={g('font-weight')} onChange={(e) => setCss('font-weight', e.target.value)}><option value="">Değiştirme</option>{['300', '400', '500', '600', '700', '800'].map((w) => <option key={w}>{w}</option>)}</select></Row_>
                    <Row_ n="Harf aralığı (px)"><input className="inp" style={{ width: 90 }} type="number" step={0.5} value={g('letter-spacing').replace('px', '')} onChange={(e) => setCss('letter-spacing', e.target.value ? `${e.target.value}px` : '')} /></Row_>
                    <Row_ n="Hizalama"><select className="inp" style={{ width: 120 }} value={g('text-align')} onChange={(e) => setCss('text-align', e.target.value)}><option value="">Değiştirme</option><option value="left">Sol</option><option value="center">Orta</option><option value="right">Sağ</option></select></Row_>
                    <Row_ n="Köşe (px)"><input className="inp" style={{ width: 90 }} type="number" min={0} max={200} placeholder={px(pick.computed['border-radius'])} value={g('border-radius').replace('px', '')} onChange={(e) => setCss('border-radius', e.target.value ? `${e.target.value}px` : '')} /></Row_>
                    <Row_ n="İç boşluk (px)"><input className="inp" style={{ width: 90 }} type="number" min={0} max={200} value={g('padding').replace('px', '')} onChange={(e) => setCss('padding', e.target.value ? `${e.target.value}px` : '')} /></Row_>
                    <Row_ n="Şeffaflık"><input type="range" min={0} max={100} value={g('opacity') ? Math.round(+g('opacity') * 100) : 100} onChange={(e) => setCss('opacity', +e.target.value === 100 ? '' : String(+e.target.value / 100))} /></Row_>
                    <Row_ n="Sitede gizle"><input type="checkbox" checked={g('display') === 'none'} onChange={(e) => setCss('display', e.target.checked ? 'none' : '')} /></Row_>
                    {curOv && <button className="btn-ghost" onClick={() => commit({ ...th, overrides: ovs.filter((o) => o.sel !== sel) })}>Bu öğenin düzenlemelerini sıfırla</button>}
                  </div>
                </>
              )}
              {ovs.length > 0 && (
                <div className="card" style={{ padding: 12, display: 'grid', gap: 6 }}>
                  <b style={{ fontSize: 13 }}>Düzenlenen öğeler ({ovs.length})</b>
                  {ovs.map((o: Override) => (
                    <div key={o.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5 }}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.sel}>{o.note || o.sel}</span>
                      <span style={{ color: 'var(--tx3)' }}>{Object.keys(o.css).length} ayar</span>
                      <button className="btn-danger" aria-label="Sil" onClick={() => commit({ ...th, overrides: ovs.filter((x) => x.id !== o.id) })}><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          <div style={{ color: 'var(--tx3)', fontSize: 12 }}>{saved ? 'Kayıtlı tasarım gösteriliyor.' : 'Henüz kaydedilmedi.'} Değişiklikler Yayına al'a basana kadar canlı siteyi etkilemez.</div>
        </div>
      </div>

      {/* ---- tuval ---- */}
      <div style={{ minWidth: 0, minHeight: 0, background: 'var(--s3)', display: 'flex', justifyContent: 'center', alignItems: 'stretch', padding: dev === 'd' ? 0 : '14px 0' }}>
        <iframe key={path} ref={ref} src={path} onLoad={() => { ready.current = true; push(); send({ type: 'aras-edit', on: edit }); if (path === '/') send({ type: 'aras-layout', ...layout }) }} title="Site önizlemesi"
          style={{ width: DEV[dev], maxWidth: '100%', height: '100%', border: 0, borderRadius: dev === 'd' ? 0 : 14, background: '#fff', boxShadow: dev === 'd' ? 'none' : '0 10px 40px rgba(0,0,0,.4)' }} />
      </div>
    </div>
  )
}
