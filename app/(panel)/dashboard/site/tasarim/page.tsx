'use client'
import { useEffect, useRef, useState } from 'react'
import { Monitor, RotateCcw, Smartphone, Tablet } from 'lucide-react'
import { PageHead } from '@panel/components/site/ui'
import { useSetting } from '@panel/components/site/useSetting'
import { COLOR_LABELS, FONTS, RADIUS_PX, THEME_DEFAULT, fontHref, type Theme } from '@/lib/site-config'

const PAGES = [['/', 'Ana sayfa'], ['/kariyer', 'Kariyer'], ['/sss', 'SSS'], ['/gizlilik', 'Gizlilik'], ['/kullanim-kosullari', 'Kullanım koşulları']]
const DEV: Record<string, number | string> = { d: '100%', t: 820, m: 390 }

const norm = (r: any): Theme => ({ ...THEME_DEFAULT, ...r, colors: { ...THEME_DEFAULT.colors, ...(r?.colors ?? {}) } })

/** Önizleme: sunucunun yazdığı temayı ezen tam bir stil. */
function fullCss(t: Theme) {
  const v = Object.entries(t.colors).map(([k, c]) => `--${k}:${c}`).join(';')
  return `:root:root{${v};--rp:${RADIUS_PX[t.radius]}}html body{font-family:'${t.font}',system-ui,sans-serif;font-size:${t.base}px}`
}

export default function Page() {
  const { val: th, setVal, saved, busy, save } = useSetting<Theme>('theme', THEME_DEFAULT, norm)
  const [path, setPath] = useState('/')
  const [dev, setDev] = useState<'d' | 't' | 'm'>('d')
  const ref = useRef<HTMLIFrameElement>(null)

  const apply = () => {
    const d = ref.current?.contentDocument
    if (!d?.head) return
    let st = d.getElementById('aras-theme-live') as HTMLStyleElement | null
    if (!st) { st = d.createElement('style'); st.id = 'aras-theme-live'; d.head.appendChild(st) }
    st.textContent = fullCss(th)
    const href = fontHref(th)
    let ln = d.getElementById('aras-font-live') as HTMLLinkElement | null
    if (href) {
      if (!ln) { ln = d.createElement('link'); ln.id = 'aras-font-live'; ln.rel = 'stylesheet'; d.head.appendChild(ln) }
      if (ln.href !== href) ln.href = href
    } else ln?.remove()
  }
  useEffect(apply, [th]) // eslint-disable-line react-hooks/exhaustive-deps

  const col = (k: keyof Theme['colors'], v: string) => setVal({ ...th, colors: { ...th.colors, [k]: v } })
  const RAD: [Theme['radius'], string][] = [['pill', 'Tam yuvarlak'], ['soft', 'Yumuşak'], ['sharp', 'Keskin']]

  return (
    <>
      <PageHead title="Tasarım" sub="Renkleri, yazı tipini ve köşe yuvarlaklığını değiştirin. Sağdaki önizleme sitenin kendisidir; değişiklikler anında görünür, Kaydet'e basınca yayına geçer."
        action={<div style={{ display: 'flex', gap: 8 }}><button className="btn-ghost" onClick={() => confirm('Tüm tasarım ayarları varsayılana dönsün mü?') && setVal(structuredClone(THEME_DEFAULT))}><RotateCcw size={14} /> Varsayılana dön</button><button className="btn" disabled={busy} onClick={() => save()}>{busy ? 'Kaydediliyor…' : 'Yayına al'}</button></div>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px,380px) 1fr', gap: 16, alignItems: 'start' }} className="tsn">
        <div style={{ display: 'grid', gap: 14 }}>
          <div className="card" style={{ padding: 16 }}>
            <b>Renkler</b>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              {(Object.keys(COLOR_LABELS) as (keyof Theme['colors'])[]).map((k) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                  <input type="color" value={th.colors[k] ?? THEME_DEFAULT.colors[k]} onChange={(e) => col(k, e.target.value)} style={{ width: 38, height: 30, border: 0, background: 'none', padding: 0 }} />
                  <span style={{ flex: 1 }}>{COLOR_LABELS[k]}</span>
                  <code style={{ color: 'var(--tx3)', fontSize: 12 }}>{th.colors[k]}</code>
                </label>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <b>Yazı</b>
            <div style={{ fontSize: 12, color: 'var(--tx3)', margin: '10px 0 4px' }}>Yazı tipi</div>
            <select className="inp" value={th.font} onChange={(e) => setVal({ ...th, font: e.target.value })}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select>
            <div style={{ fontSize: 12, color: 'var(--tx3)', margin: '12px 0 4px' }}>Temel yazı boyutu: {th.base}px</div>
            <input type="range" min={14} max={20} value={th.base} onChange={(e) => setVal({ ...th, base: +e.target.value })} style={{ width: '100%' }} />
          </div>
          <div className="card" style={{ padding: 16 }}>
            <b>Köşeler (düğme, etiket, kart)</b>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {RAD.map(([k, n]) => <button key={k} className={th.radius === k ? 'btn' : 'btn-ghost'} onClick={() => setVal({ ...th, radius: k })}>{n}</button>)}
            </div>
          </div>
          <div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>{saved ? 'Kayıtlı tasarım gösteriliyor.' : 'Henüz kaydedilmedi; varsayılan tasarım gösteriliyor.'}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
            {PAGES.map(([p, n]) => <button key={p} className={path === p ? 'btn' : 'btn-ghost'} onClick={() => setPath(p)}>{n}</button>)}
            <span style={{ flex: 1 }} />
            {([['d', Monitor], ['t', Tablet], ['m', Smartphone]] as const).map(([k, I]) => <button key={k} className={dev === k ? 'btn' : 'btn-ghost'} aria-label={k} onClick={() => setDev(k)}><I size={15} /></button>)}
          </div>
          <div style={{ background: 'var(--s3)', borderRadius: 10, display: 'flex', justifyContent: 'center', padding: dev === 'd' ? 0 : 12 }}>
            <iframe key={path} ref={ref} src={path} onLoad={apply} title="Site önizlemesi" style={{ width: DEV[dev], maxWidth: '100%', height: '78vh', border: 0, borderRadius: dev === 'd' ? 8 : 12, background: '#fff' }} />
          </div>
        </div>
      </div>
      <style>{`@media(max-width:1000px){.tsn{grid-template-columns:1fr!important}}`}</style>
    </>
  )
}
