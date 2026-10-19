'use client'
import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { ImageField, Label, PageHead, api, getRows, useToast, type Row } from '@panel/components/site/ui'
import { Table } from '@panel/components/site/analytics-ui'

const PAGES: [string, string][] = [['/', 'Ana sayfa'], ['/sss', 'Sık sorulan sorular'], ['/kariyer', 'Kariyer'], ['/gizlilik', 'Gizlilik politikası'], ['/cerez-politikasi', 'Çerez politikası'], ['/kullanim-kosullari', 'Kullanım koşulları']]
const tone = (n: number, lo: number, hi: number) => (!n ? 'var(--red)' : n < lo || n > hi ? 'var(--amber)' : 'var(--green)')

export default function PagesTab() {
  const say = useToast()
  const [cfg, setCfg] = useState<Record<string, Row>>({})
  const [sel, setSel] = useState('/sss')
  const [scan, setScan] = useState<Row[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { getRows('site_settings').then((r) => setCfg(r.find((x) => x.key === 'seo_pages')?.value ?? {})).catch((e) => say(e.message)) }, [say])
  const run = useCallback(() => { setBusy(true); setScan(null); api('GET', `/api/site?seopages=${PAGES.map((p) => p[0]).join(',')}`).then((j) => setScan(j.pages)).catch((e) => say(e.message)).finally(() => setBusy(false)) }, [say])
  useEffect(() => { run() }, [run])

  const cur: Row = cfg[sel] ?? {}
  const set = (k: string, v: any) => setCfg({ ...cfg, [sel]: { ...cur, [k]: v } })
  const found = scan?.find((p) => p.path === sel)
  const title: string = cur.title ?? ''
  const desc: string = cur.desc ?? ''

  async function save() {
    setSaving(true)
    try {
      const clean = Object.fromEntries(Object.entries(cfg).map(([p, v]) => [p, { title: (v.title ?? '').trim(), desc: (v.desc ?? '').trim(), og: (v.og ?? '').trim(), noindex: v.noindex === true }]))
      await api('POST', '/api/site', { action: 'upsert', table: 'site_settings', row: { key: 'seo_pages', value: clean } })
      say('Kaydedildi. Sitede 5 dk içinde yansır.')
    } catch (e: any) { say(e.message) } finally { setSaving(false) }
  }

  return (
    <>
      <PageHead title="Sayfa bazlı SEO" sub="Her sayfanın arama sonucunda görünen başlığını, açıklamasını ve paylaşım görselini ayrı ayrı belirleyin. Boş bırakılan alanda varsayılan metin kullanılır." action={<button className="btn-ghost" onClick={run} disabled={busy}><RefreshCw size={14} /> {busy ? 'Taranıyor…' : 'Sayfaları tara'}</button>} />
      <div className="card">
        <div className="card-h"><span className="card-title">Sayfa taraması</span><span className="card-meta">canlı siteden okunur</span></div>
        <Table cols={[
          { h: 'Sayfa', k: 'path', f: (x) => PAGES.find((p) => p[0] === x)?.[1] ?? x },
          { h: 'Başlık', k: 'title', f: (x: string) => <span style={{ color: tone(x.length, 30, 60) }}>{x.length} kr</span> },
          { h: 'Açıklama', k: 'desc', f: (x: string) => <span style={{ color: tone(x.length, 110, 160) }}>{x.length} kr</span> },
          { h: 'H1', k: 'h1', r: true, f: (x) => <span style={{ color: x === 1 ? 'var(--green)' : 'var(--amber)' }}>{x}</span> },
          { h: 'Kelime', k: 'words', r: true, f: (x) => <span style={{ color: x >= 150 ? 'var(--green)' : 'var(--amber)' }}>{x}</span> },
          { h: 'Alt yok', k: 'noAlt', r: true, f: (x, r) => <span style={{ color: x ? 'var(--amber)' : 'var(--green)' }}>{x}/{r.images}</span> },
          { h: 'Canonical', k: 'canonical', f: (x) => (x ? '✓' : '✗') },
          { h: 'Paylaşım görseli', k: 'og', f: (x) => (x ? '✓' : '✗') },
          { h: 'Yapısal veri', k: 'jsonld', f: (x) => (x ? '✓' : '–') },
          { h: 'Dizinleme', k: 'noindex', f: (x) => (x ? <span style={{ color: 'var(--red)' }}>kapalı</span> : 'açık') },
          { h: 'Süre', k: 'ms', r: true, f: (x) => `${x} ms` },
        ]} rows={scan ?? []} empty={busy ? 'Sayfalar taranıyor…' : 'Tarama sonucu yok'} />
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><span className="card-title">Sayfayı düzenle</span>
          <select className="inp" style={{ width: 220 }} value={sel} onChange={(e) => setSel(e.target.value)}>{PAGES.map(([p, n]) => <option key={p} value={p}>{n}</option>)}</select></div>
        <div style={{ padding: 20, maxWidth: 720 }}>
          {sel === '/' && <div style={{ background: 'var(--amber2)', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>Ana sayfanın başlığı ve açıklaması “Genel” sekmesinde (dil dil) düzenlenir. Burada yalnızca paylaşım görseli ve dizinleme geçerlidir.</div>}
          <div style={{ border: '1px solid var(--bdr)', borderRadius: 10, padding: '12px 14px', background: 'var(--s2)' }}>
            <div style={{ fontSize: 12, color: 'var(--tx3)' }}>arasmetal.com{sel === '/' ? '' : sel}</div>
            <div style={{ fontSize: 17, color: 'var(--blue)', margin: '2px 0' }}>{title || found?.title || 'Başlık yok'}</div>
            <div style={{ fontSize: 13, color: 'var(--tx2)' }}>{desc || found?.desc || 'Açıklama yok'}</div>
          </div>
          {sel !== '/' && (
            <>
              <Label>Başlık <span style={{ color: tone(title.length, 30, 60) }}>({title.length}/60)</span></Label>
              <input className="inp" value={title} onChange={(e) => set('title', e.target.value)} placeholder={found?.title} />
              <Label>Açıklama <span style={{ color: tone(desc.length, 110, 160) }}>({desc.length}/160)</span></Label>
              <textarea className="inp" rows={3} value={desc} onChange={(e) => set('desc', e.target.value)} placeholder={found?.desc} />
            </>
          )}
          <Label>Paylaşım görseli (1200×630)</Label>
          <ImageField value={cur.og ?? ''} onChange={(v) => set('og', v)} />
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, cursor: 'pointer', fontWeight: 600 }}>
            <input type="checkbox" checked={cur.noindex === true} onChange={(e) => set('noindex', e.target.checked)} /> Bu sayfayı arama motorlarından gizle (sitemap’ten de çıkar)
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}><button className="btn" disabled={saving} onClick={save}>{saving ? '…' : 'Kaydet'}</button></div>
        </div>
      </div>
    </>
  )
}
