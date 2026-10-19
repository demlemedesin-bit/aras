'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MousePointerClick, Monitor, RotateCcw, Smartphone, Tablet, Trash2 } from 'lucide-react'
import { PageHead } from '@panel/components/site/ui'
import { useSetting } from '@panel/components/site/useSetting'
import { ColorPicker } from '@panel/components/site/ColorPicker'
import { COLOR_GROUPS, FONTS, PRESETS, THEME_DEFAULT, fontHref, themeCssFull, type ColorKey, type Override, type Theme } from '@/lib/site-config'

const PAGES = [['/', 'Ana sayfa'], ['/kariyer', 'Kariyer'], ['/sss', 'SSS'], ['/gizlilik', 'Gizlilik'], ['/kullanim-kosullari', 'Kullanım koşulları']]
const DEV: Record<string, number | string> = { d: '100%', t: 820, m: 390 }
const PAIR: Partial<Record<ColorKey, ColorKey>> = { k: 'w', ash: 'w', bt: 'btt', btt: 'bt', dk: 'dkt', dkt: 'dk', hd: 'k', w: 'k' }
const norm = (r: any): Theme => ({ ...THEME_DEFAULT, ...r, colors: { ...THEME_DEFAULT.colors, ...(r?.colors ?? {}) }, overrides: r?.overrides ?? [] })
const rgbToHex = (c: string) => { const m = c.match(/\d+(\.\d+)?/g); if (!m || m.length < 3) return ''; if (m[3] !== undefined && +m[3] === 0) return ''; return '#' + m.slice(0, 3).map((x) => Math.round(+x).toString(16).padStart(2, '0')).join('') }
const px = (v: string) => (v?.endsWith('px') ? String(Math.round(parseFloat(v))) : '')

type Pick = { similar: string; exact: string; label: string; computed: Record<string, string> }
type Tab = 'tema' | 'renk' | 'yazi' | 'oge'

export default function Page() {
  const { val: th, setVal, saved, busy, save } = useSetting<Theme>('theme', THEME_DEFAULT, norm)
  const [path, setPath] = useState('/')
  const [dev, setDev] = useState<'d' | 't' | 'm'>('d')
  const [tab, setTab] = useState<Tab>('tema')
  const [edit, setEdit] = useState(false)
  const [pick, setPick] = useState<Pick | null>(null)
  const [scope, setScope] = useState<'similar' | 'exact'>('similar')
  const ref = useRef<HTMLIFrameElement>(null)
  const ready = useRef(false)

  const send = useCallback((m: any) => ref.current?.contentWindow?.postMessage(m, location.origin), [])
  const push = useCallback(() => { send({ type: 'aras-theme', css: themeCssFull(th), font: fontHref(th) }) }, [th, send])
  useEffect(() => { if (ready.current) push() }, [push])
  useEffect(() => { send({ type: 'aras-edit', on: edit }) }, [edit, send, path])
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== ref.current?.contentWindow) return
      if (e.data?.type === 'aras-ready') { ready.current = true; push(); send({ type: 'aras-edit', on: edit }) }
      if (e.data?.type === 'aras-pick') { setPick(e.data); setTab('oge') }
    }
    addEventListener('message', on); return () => removeEventListener('message', on)
  })

  const col = (k: ColorKey, v: string) => setVal({ ...th, colors: { ...th.colors, [k]: v } })
  const sel = pick ? (scope === 'similar' ? pick.similar : pick.exact) : ''
  const ovs = th.overrides ?? []
  const cur = ovs.find((o) => o.sel === sel)
  const setCss = (prop: string, v: string) => {
    if (!pick) return
    const css = { ...(cur?.css ?? {}) }
    if (v === '' || v == null) delete css[prop]; else css[prop] = v
    const rest = ovs.filter((o) => o.sel !== sel)
    setVal({ ...th, overrides: Object.keys(css).length ? [...rest, { id: cur?.id ?? `o${Date.now().toString(36)}`, sel, note: pick.label, css }] : rest })
  }
  const g = (prop: string) => cur?.css[prop] ?? ''
  const dis = (prop: string, fallback: string) => g(prop) || rgbToHex(pick?.computed[prop] ?? '') || fallback
  const applyPreset = (t: Partial<Theme>) => setVal({ ...th, ...t, colors: { ...THEME_DEFAULT.colors, ...(t.colors ?? {}) }, radius: t.radius ?? 'pill', overrides: th.overrides })
  const Tb = ({ k, n }: { k: Tab; n: string }) => <button className={tab === k ? 'btn' : 'btn-ghost'} onClick={() => setTab(k)}>{n}</button>
  const Row = ({ n, children }: { n: string; children: React.ReactNode }) => <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, minHeight: 34 }}><span style={{ flex: 1 }}>{n}</span>{children}</label>

  return (
    <>
      <PageHead title="Tasarım" sub="Sağdaki önizleme sitenin kendisidir. Soldan renk ve yazıyı değiştirin ya da “Öğe seç”e basıp sitede herhangi bir yere tıklayarak onu düzenleyin."
        action={<div style={{ display: 'flex', gap: 8 }}><button className="btn-ghost" onClick={() => confirm('Tüm tasarım ayarları (özel öğe düzenlemeleri dahil) varsayılana dönsün mü?') && setVal(structuredClone(THEME_DEFAULT))}><RotateCcw size={14} /> Varsayılana dön</button><button className="btn" disabled={busy} onClick={() => save()}>{busy ? 'Kaydediliyor…' : 'Yayına al'}</button></div>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(310px,400px) 1fr', gap: 16, alignItems: 'start' }} className="tsn">
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><Tb k="tema" n="Hazır temalar" /><Tb k="renk" n="Renkler" /><Tb k="yazi" n="Yazı & köşe" /><Tb k="oge" n={`Seçili öğe${ovs.length ? ` (${ovs.length})` : ''}`} /></div>

          {tab === 'tema' && (
            <div className="card" style={{ padding: 14, display: 'grid', gap: 10 }}>
              <div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>Bir tema seçince renkler ve köşeler değişir. Sonra Renkler sekmesinde istediğiniz rengi ayrıca değiştirebilirsiniz.</div>
              {PRESETS.map((p) => (
                <button key={p.n} className="btn-ghost" style={{ justifyContent: 'flex-start', gap: 10, padding: 10 }} onClick={() => applyPreset(p.t)}>
                  <span style={{ display: 'flex' }}>{(['w', 'k', 'gr', 'bt', 'dk'] as ColorKey[]).map((k) => <i key={k} style={{ width: 20, height: 20, borderRadius: '50%', marginRight: -5, background: p.t.colors?.[k] ?? THEME_DEFAULT.colors[k], border: '1px solid var(--bdr)' }} />)}</span>
                  <span style={{ marginLeft: 8 }}>{p.n}</span>
                </button>
              ))}
            </div>
          )}

          {tab === 'renk' && COLOR_GROUPS.map((gr) => (
            <div key={gr.n} className="card" style={{ padding: 14 }}>
              <b>{gr.n}</b>
              {gr.keys.map((c) => (
                <div key={c.k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <ColorPicker value={th.colors[c.k] ?? THEME_DEFAULT.colors[c.k]!} onChange={(v) => col(c.k, v)} against={PAIR[c.k] ? (th.colors[PAIR[c.k]!] ?? THEME_DEFAULT.colors[PAIR[c.k]!]) : undefined} title={c.n} />
                  <div style={{ flex: 1, lineHeight: 1.25 }}><div style={{ fontSize: 13.5 }}>{c.n}</div><div style={{ fontSize: 11.5, color: 'var(--tx3)' }}>{c.d}</div></div>
                  <code style={{ fontSize: 11.5, color: 'var(--tx3)' }}>{th.colors[c.k]}</code>
                </div>
              ))}
            </div>
          ))}

          {tab === 'yazi' && (
            <div className="card" style={{ padding: 14, display: 'grid', gap: 12 }}>
              <div><div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 4 }}>Gövde yazı tipi</div><select className="inp" value={th.font} onChange={(e) => setVal({ ...th, font: e.target.value })}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select></div>
              <div><div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 4 }}>Başlık yazı tipi</div><select className="inp" value={th.headFont} onChange={(e) => setVal({ ...th, headFont: e.target.value })}><option value="">Gövde ile aynı</option>{FONTS.map((f) => <option key={f}>{f}</option>)}</select></div>
              <div><div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 4 }}>Temel yazı boyutu: {th.base}px</div><input type="range" min={14} max={20} value={th.base} onChange={(e) => setVal({ ...th, base: +e.target.value })} style={{ width: '100%' }} /></div>
              <div><div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 6 }}>Köşeler (düğme, etiket, kart)</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{([['pill', 'Tam yuvarlak'], ['soft', 'Yumuşak'], ['sharp', 'Keskin']] as const).map(([k, n]) => <button key={k} className={th.radius === k ? 'btn' : 'btn-ghost'} onClick={() => setVal({ ...th, radius: k })}>{n}</button>)}</div></div>
            </div>
          )}

          {tab === 'oge' && (
            <div className="card" style={{ padding: 14, display: 'grid', gap: 8 }}>
              {!pick ? (
                <div style={{ color: 'var(--tx3)', fontSize: 13 }}>Önizlemenin üstündeki <b>Öğe seç</b> düğmesine basın, sonra sitede bir başlığa, düğmeye, bölüme ya da yazıya tıklayın. Burada rengi, boyutu ve görünürlüğü değişir.</div>
              ) : (
                <>
                  <div style={{ fontSize: 13 }}><b>{pick.label}</b></div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className={scope === 'similar' ? 'btn' : 'btn-ghost'} onClick={() => setScope('similar')}>Benzerlerin hepsi</button>
                    <button className={scope === 'exact' ? 'btn' : 'btn-ghost'} onClick={() => setScope('exact')}>Yalnızca bu</button>
                  </div>
                  <code style={{ fontSize: 11, color: 'var(--tx3)', wordBreak: 'break-all' }}>{sel}</code>
                  <Row n="Yazı rengi"><ColorPicker value={dis('color', '#000000')} onChange={(v) => setCss('color', v)} title="Yazı rengi" /></Row>
                  <Row n="Zemin rengi"><ColorPicker value={dis('background-color', '#ffffff')} onChange={(v) => setCss('background-color', v)} title="Zemin rengi" /></Row>
                  <Row n="Yazı boyutu (px)"><input className="inp" style={{ width: 90 }} type="number" min={8} max={200} placeholder={px(pick.computed['font-size'])} value={g('font-size').replace('px', '')} onChange={(e) => setCss('font-size', e.target.value ? `${e.target.value}px` : '')} /></Row>
                  <Row n="Kalınlık"><select className="inp" style={{ width: 120 }} value={g('font-weight')} onChange={(e) => setCss('font-weight', e.target.value)}><option value="">Değiştirme</option>{['300', '400', '500', '600', '700', '800'].map((w) => <option key={w}>{w}</option>)}</select></Row>
                  <Row n="Harf aralığı (px)"><input className="inp" style={{ width: 90 }} type="number" step={0.5} value={g('letter-spacing').replace('px', '')} onChange={(e) => setCss('letter-spacing', e.target.value ? `${e.target.value}px` : '')} /></Row>
                  <Row n="Hizalama"><select className="inp" style={{ width: 120 }} value={g('text-align')} onChange={(e) => setCss('text-align', e.target.value)}><option value="">Değiştirme</option><option value="left">Sol</option><option value="center">Orta</option><option value="right">Sağ</option></select></Row>
                  <Row n="Köşe yuvarlaklığı (px)"><input className="inp" style={{ width: 90 }} type="number" min={0} max={200} placeholder={px(pick.computed['border-radius'])} value={g('border-radius').replace('px', '')} onChange={(e) => setCss('border-radius', e.target.value ? `${e.target.value}px` : '')} /></Row>
                  <Row n="İç boşluk (px)"><input className="inp" style={{ width: 90 }} type="number" min={0} max={200} value={g('padding').replace('px', '')} onChange={(e) => setCss('padding', e.target.value ? `${e.target.value}px` : '')} /></Row>
                  <Row n="Şeffaflık"><input type="range" min={0} max={100} value={g('opacity') ? Math.round(+g('opacity') * 100) : 100} onChange={(e) => setCss('opacity', +e.target.value === 100 ? '' : String(+e.target.value / 100))} /></Row>
                  <Row n="Sitede gizle"><input type="checkbox" checked={g('display') === 'none'} onChange={(e) => setCss('display', e.target.checked ? 'none' : '')} /></Row>
                  {cur && <button className="btn-ghost" onClick={() => setVal({ ...th, overrides: ovs.filter((o) => o.sel !== sel) })}>Bu öğenin düzenlemelerini sıfırla</button>}
                </>
              )}
              {ovs.length > 0 && (
                <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: 10, display: 'grid', gap: 6 }}>
                  <b style={{ fontSize: 13 }}>Düzenlenen öğeler</b>
                  {ovs.map((o: Override) => (
                    <div key={o.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5 }}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.sel}>{o.note || o.sel}</span>
                      <span style={{ color: 'var(--tx3)' }}>{Object.keys(o.css).length} ayar</span>
                      <button className="btn-danger" aria-label="Sil" onClick={() => setVal({ ...th, overrides: ovs.filter((x) => x.id !== o.id) })}><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>{saved ? 'Kayıtlı tasarım gösteriliyor.' : 'Henüz kaydedilmedi; varsayılan tasarım gösteriliyor.'} Önizlemedeki değişiklikler “Yayına al”a basana kadar canlı siteyi etkilemez.</div>
        </div>

        <div className="card" style={{ padding: 10, position: 'sticky', top: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
            <button className={edit ? 'btn' : 'btn-ghost'} onClick={() => setEdit((x) => !x)}><MousePointerClick size={15} /> {edit ? 'Seçim açık: sitede tıklayın' : 'Öğe seç'}</button>
            {PAGES.map(([p, n]) => <button key={p} className={path === p ? 'btn' : 'btn-ghost'} onClick={() => { setPath(p); setPick(null) }}>{n}</button>)}
            <span style={{ flex: 1 }} />
            {([['d', Monitor], ['t', Tablet], ['m', Smartphone]] as const).map(([k, I]) => <button key={k} className={dev === k ? 'btn' : 'btn-ghost'} aria-label={k} onClick={() => setDev(k)}><I size={15} /></button>)}
          </div>
          <div style={{ background: 'var(--s3)', borderRadius: 10, display: 'flex', justifyContent: 'center', padding: dev === 'd' ? 0 : 12 }}>
            <iframe key={path} ref={ref} src={path} onLoad={() => { ready.current = true; push(); send({ type: 'aras-edit', on: edit }) }} title="Site önizlemesi" style={{ width: DEV[dev], maxWidth: '100%', height: '80vh', border: 0, borderRadius: dev === 'd' ? 8 : 12, background: '#fff' }} />
          </div>
        </div>
      </div>
      <style>{`@media(max-width:1000px){.tsn{grid-template-columns:1fr!important}}`}</style>
    </>
  )
}
