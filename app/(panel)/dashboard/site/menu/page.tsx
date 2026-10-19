'use client'
import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { LANGS, LANG_NAMES, PageHead } from '@panel/components/site/ui'
import { useSetting } from '@panel/components/site/useSetting'
import { ACTION_HREF, DEFAULT_NAV, KIND_NAMES, PAGE_PATHS, SECTION_IDS, kindOf, type Link, type LinkKind, type NavCfg } from '@/lib/site-config'
import i18n from '@/lib/i18n-data.json'

type TabKey = 'header' | 'dock' | 'footer'
const mv = <T,>(a: T[], i: number, d: -1 | 1) => { const b = [...a]; const j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b }
const TABS: { k: TabKey; n: string; hint: string }[] = [
  { k: 'header', n: 'Üst menü', hint: 'Sayfanın üstündeki menü ve mobildeki açılır menü. “Açılır menü” seçtiğiniz bağlantılar üzerine gelince alt bağlantılarını gösterir.' },
  { k: 'dock', n: 'Alt çubuk', hint: 'Masaüstünde ekranın altında yüzen bölüm bağlantıları.' },
  { k: 'footer', n: 'Footer', hint: 'Sayfa sonundaki bağlantılar.' },
]
const BASIC: LinkKind[] = ['section', 'page', 'url', 'catalog', 'login', 'lang', 'tour']
const dflt = (l: Link, lang: string) => (l.key ? ((i18n as any).t[lang]?.[l.key] ?? (i18n as any).t.tr?.[l.key] ?? '') : '')
const lbl = (l: Link, lang: string) => (l.label as Record<string, string> | undefined)?.[lang] ?? ''
const FIELD = { fontSize: 12, color: 'var(--tx3)', marginBottom: 3 } as const

/** Tek bağlantı: ad + “tıklayınca ne olsun” + hedef. */
function Row({ l, lang, kinds, onChange, onMove, onDelete, depth = 0 }: { l: Link; lang: string; kinds: LinkKind[]; onChange: (p: Partial<Link>) => void; onMove: (d: -1 | 1) => void; onDelete: () => void; depth?: number }) {
  const k = kindOf(l)
  const setKind = (nk: LinkKind) => {
    const patch: Partial<Link> = { kind: nk }
    if (ACTION_HREF[nk]) patch.href = ACTION_HREF[nk]!
    else if (nk === 'section') patch.href = l.href.startsWith('#') && !ACTION_HREF.catalog?.includes(l.href) ? l.href : '#iletisim'
    else if (nk === 'page') patch.href = l.href.startsWith('/') ? l.href : '/sss'
    else if (nk === 'url') patch.href = /^https?:/.test(l.href) ? l.href : 'https://'
    else if (nk === 'cats') { patch.href = '#koleksiyonlar'; patch.world = l.world ?? 'home' }
    else if (nk === 'menu') { patch.href = '#'; patch.children = l.children ?? [] }
    onChange(patch)
  }
  const children = l.children ?? []
  return (
    <div className="card" style={{ padding: 12, marginLeft: depth * 22, display: 'grid', gap: 8, opacity: l.show ? 1 : 0.55 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input className="inp" style={{ flex: '1 1 160px' }} placeholder={dflt(l, lang) || `Görünen ad (${LANG_NAMES[lang]})`} value={lbl(l, lang)} onChange={(e) => onChange({ label: { ...l.label, [lang]: e.target.value } as Link['label'] })} />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={l.show} onChange={(e) => onChange({ show: e.target.checked })} /> Görünsün</label>
        <button className="btn-ghost" aria-label="Yukarı" onClick={() => onMove(-1)}><ArrowUp size={14} /></button>
        <button className="btn-ghost" aria-label="Aşağı" onClick={() => onMove(1)}><ArrowDown size={14} /></button>
        <button className="btn-danger" aria-label="Sil" onClick={onDelete}><Trash2 size={14} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
        <div>
          <div style={FIELD}>Tıklayınca ne olsun?</div>
          <select className="inp" value={k} onChange={(e) => setKind(e.target.value as LinkKind)}>{kinds.map((x) => <option key={x} value={x}>{KIND_NAMES[x]}</option>)}</select>
        </div>
        {k === 'section' && (
          <div><div style={FIELD}>Hangi bölüm?</div>
            <select className="inp" value={l.href.replace(/^\//, '')} onChange={(e) => onChange({ href: e.target.value })}>
              {SECTION_IDS.map(([id, n]) => <option key={id} value={`#${id}`}>{n}</option>)}
              {!SECTION_IDS.some(([id]) => `#${id}` === l.href) && <option value={l.href}>{l.href}</option>}
            </select></div>
        )}
        {k === 'page' && (
          <div><div style={FIELD}>Hangi sayfa? (veya kendi yolunuzu yazın)</div>
            <input className="inp" list="pages-dl" value={l.href} onChange={(e) => onChange({ href: e.target.value })} placeholder="/sayfa veya /#bolum" /></div>
        )}
        {k === 'url' && <div><div style={FIELD}>Adres</div><input className="inp" value={l.href} onChange={(e) => onChange({ href: e.target.value })} placeholder="https://…" /></div>}
        {k === 'cats' && (
          <div><div style={FIELD}>Hangi kategoriler açılsın?</div>
            <select className="inp" value={l.world ?? 'home'} onChange={(e) => onChange({ world: e.target.value as 'home' | 'garden' })}>
              <option value="home">Home (Ev) kategorileri</option><option value="garden">Garden (Bahçe) kategorileri</option>
            </select></div>
        )}
      </div>
      {k === 'cats' && <div style={{ fontSize: 12, color: 'var(--tx3)' }}>Üzerine gelince Kategoriler sayfasındaki ağaç (ana ve alt kategoriler) açılır. Tıklayınca Koleksiyonlar bölümüne gider; bayi girişi yapılmışsa katalog açılır.</div>}
      {k === 'menu' && (
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--tx3)' }}>Üzerine gelince aşağıdaki bağlantılar açılır.</div>
          {children.map((c, i) => (
            <Row key={c.id} l={c} lang={lang} kinds={BASIC} depth={1}
              onChange={(p) => onChange({ children: children.map((x, j) => (j === i ? { ...x, ...p } : x)) })}
              onMove={(d) => onChange({ children: mv(children, i, d) })}
              onDelete={() => onChange({ children: children.filter((_, j) => j !== i) })} />
          ))}
          <div><button className="btn-ghost" onClick={() => onChange({ children: [...children, { id: `c${Date.now().toString(36)}`, label: {}, href: '#iletisim', show: true, kind: 'section' }] })}><Plus size={14} /> Alt bağlantı ekle</button></div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const { val: nav, setVal, saved, busy, save } = useSetting<NavCfg>('nav', DEFAULT_NAV, (r) => ({ v: 2, header: r.header ?? DEFAULT_NAV.header, dock: r.dock ?? DEFAULT_NAV.dock, footer: r.footer ?? DEFAULT_NAV.footer }))
  const [tab, setTab] = useState<TabKey>('header')
  const [lang, setLang] = useState<string>('tr')
  const list = nav[tab] ?? []
  const set = (l: Link[]) => setVal({ ...nav, v: 2, [tab]: l })
  const patch = (i: number, p: Partial<Link>) => set(list.map((x, j) => (j === i ? { ...x, ...p } : x)))
  const cur = TABS.find((t) => t.k === tab)!
  const kinds: LinkKind[] = tab === 'header' ? [...BASIC, 'cats', 'menu'] : BASIC

  return (
    <>
      <PageHead title="Menü & Footer" sub="Her bağlantı için görünen adı (6 dilde), tıklayınca ne açılacağını ve sırasını belirleyin. Üst menüde açılır menü ve alt menü oluşturabilirsiniz."
        action={<div style={{ display: 'flex', gap: 8 }}><button className="btn-ghost" onClick={() => confirm('Bu bölüm varsayılana dönsün mü?') && set(structuredClone(DEFAULT_NAV[tab]))}><RotateCcw size={14} /> Varsayılana dön</button><button className="btn" disabled={busy} onClick={() => save()}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button></div>} />
      <datalist id="pages-dl">{PAGE_PATHS.map(([p, n]) => <option key={p} value={p}>{n}</option>)}</datalist>
      <div className="card" style={{ padding: 14, marginBottom: 16, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{TABS.map((t) => <button key={t.k} className={tab === t.k ? 'btn' : 'btn-ghost'} onClick={() => setTab(t.k)}>{t.n}</button>)}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{LANGS.map((l) => <button key={l} className={lang === l ? 'btn' : 'btn-ghost'} onClick={() => setLang(l)}>{LANG_NAMES[l]}</button>)}</div>
        <div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>{cur.hint} {saved ? '' : 'Henüz kaydedilmedi; varsayılan liste gösteriliyor.'} Ad boş bırakılırsa varsayılan metin (gri yazı) kullanılır. Kaydedince sitede anında görünür; Tasarım sayfasındaki önizlemeden kontrol edebilirsiniz.</div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {list.map((l, i) => <Row key={l.id} l={l} lang={lang} kinds={kinds} onChange={(p) => patch(i, p)} onMove={(d) => set(mv(list, i, d))} onDelete={() => set(list.filter((_, j) => j !== i))} />)}
      </div>
      <div style={{ marginTop: 14 }}><button className="btn" onClick={() => set([...list, { id: `l${Date.now().toString(36)}`, label: {}, href: '#iletisim', show: true, kind: 'section' }])}><Plus size={14} /> Bağlantı ekle</button></div>
    </>
  )
}
