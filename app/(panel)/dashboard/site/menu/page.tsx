'use client'
import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { LANGS, LANG_NAMES, PageHead } from '@panel/components/site/ui'
import { useSetting } from '@panel/components/site/useSetting'
import { DEFAULT_NAV, type Link, type NavCfg } from '@/lib/site-config'
import i18n from '@/lib/i18n-data.json'

const mv = <T,>(a: T[], i: number, d: -1 | 1) => { const b = [...a]; const j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b }
const TABS: { k: keyof NavCfg; n: string; hint: string }[] = [
  { k: 'header', n: 'Üst menü', hint: 'Sayfanın üstündeki menü ve mobildeki açılır menüdeki bağlantılar. Home / Garden menüleri kategori ağacından gelir.' },
  { k: 'dock', n: 'Alt çubuk', hint: 'Masaüstünde ekranın altında yüzen bölüm bağlantıları.' },
  { k: 'footer', n: 'Footer', hint: 'Sayfa sonundaki bağlantılar. #katalog yazarsanız bayi giriş penceresini açar.' },
]
const dflt = (l: Link, lang: string) => (l.key ? ((i18n as any).t[lang]?.[l.key] ?? (i18n as any).t.tr?.[l.key] ?? '') : '')

export default function Page() {
  const { val: nav, setVal, saved, busy, save } = useSetting<NavCfg>('nav', DEFAULT_NAV, (r) => ({ header: r.header ?? DEFAULT_NAV.header, dock: r.dock ?? DEFAULT_NAV.dock, footer: r.footer ?? DEFAULT_NAV.footer }))
  const [tab, setTab] = useState<keyof NavCfg>('header')
  const [lang, setLang] = useState<string>('tr')
  const list = nav[tab]
  const set = (l: Link[]) => setVal({ ...nav, [tab]: l })
  const patch = (i: number, p: Partial<Link>) => set(list.map((x, j) => (j === i ? { ...x, ...p } : x)))
  const cur = TABS.find((t) => t.k === tab)!

  return (
    <>
      <PageHead title="Menü & Footer" sub="Üst menü, alt çubuk ve footer bağlantılarını ekleyin, gizleyin, sıralayın ve her dilde adlandırın."
        action={<div style={{ display: 'flex', gap: 8 }}><button className="btn-ghost" onClick={() => confirm('Bu bölüm varsayılana dönsün mü?') && set(structuredClone(DEFAULT_NAV[tab]))}><RotateCcw size={14} /> Varsayılana dön</button><button className="btn" disabled={busy} onClick={() => save()}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button></div>} />
      <div className="card" style={{ padding: 14, marginBottom: 16, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{TABS.map((t) => <button key={t.k} className={tab === t.k ? 'btn' : 'btn-ghost'} onClick={() => setTab(t.k)}>{t.n}</button>)}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{LANGS.map((l) => <button key={l} className={lang === l ? 'btn' : 'btn-ghost'} onClick={() => setLang(l)}>{LANG_NAMES[l]}</button>)}</div>
        <div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>{cur.hint} {saved ? '' : 'Henüz kaydedilmedi; varsayılan liste gösteriliyor.'} Ad boş bırakılırsa varsayılan metin (gri yazı) kullanılır.</div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {list.map((l, i) => (
          <div key={l.id} className="card" style={{ padding: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', opacity: l.show ? 1 : 0.55 }}>
            <input className="inp" style={{ flex: '1 1 180px' }} placeholder={dflt(l, lang) || `Ad (${LANG_NAMES[lang]})`} value={(l.label as Record<string, string> | undefined)?.[lang] ?? ''} onChange={(e) => patch(i, { label: { ...l.label, [lang]: e.target.value } as Link['label'] })} />
            <input className="inp" style={{ flex: '1 1 200px' }} placeholder="/sayfa, #bolum veya https://…" value={l.href} onChange={(e) => patch(i, { href: e.target.value })} />
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={l.show} onChange={(e) => patch(i, { show: e.target.checked })} /> Görünsün</label>
            <button className="btn-ghost" aria-label="Yukarı" onClick={() => set(mv(list, i, -1))}><ArrowUp size={14} /></button>
            <button className="btn-ghost" aria-label="Aşağı" onClick={() => set(mv(list, i, 1))}><ArrowDown size={14} /></button>
            <button className="btn-danger" aria-label="Sil" onClick={() => set(list.filter((_, j) => j !== i))}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}><button className="btn" onClick={() => set([...list, { id: `l${Date.now().toString(36)}`, label: {}, href: '', show: true }])}><Plus size={14} /> Bağlantı ekle</button></div>
    </>
  )
}
