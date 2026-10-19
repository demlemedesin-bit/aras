'use client'
import { useEffect, useState } from 'react'
import ListManager from '@panel/components/site/ListManager'
import { Label, Pill, api, getRows, useToast, type Row } from '@panel/components/site/ui'
import { DEFAULT_CATEGORIES, catName, resolveCat, type Cat } from '@/lib/categories'

const norm = (s: string) => s.toLocaleLowerCase('tr').replace(/[^a-z0-9çğıöşü]+/g, ' ').trim()

function Bulk() {
  const say = useToast()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [cats, setCats] = useState<Cat[]>(DEFAULT_CATEGORIES)
  const [busy, setBusy] = useState(false)
  useEffect(() => { getRows('site_settings').then((r) => { const c = r.find((x) => x.key === 'categories')?.value; if (Array.isArray(c) && c.length) setCats(c) }).catch(() => {}) }, [])

  function findCat(raw: string): { id: string; world: 'home' | 'garden' } | null {
    const [a, b] = raw.split(/>|›/).map((x) => norm(x))
    const mains = cats.filter((m) => norm(catName(m.name, 'tr')) === a || norm(catName(m.name, 'en')) === a || m.id === a)
    if (b) { for (const m of mains) { const s = m.subs.find((x) => norm(catName(x.name, 'tr')) === b || norm(catName(x.name, 'en')) === b); if (s) return { id: s.id, world: m.world } } return null }
    if (mains[0]) return { id: mains[0].id, world: mains[0].world }
    for (const m of cats) { const s = m.subs.find((x) => norm(catName(x.name, 'tr')) === a || norm(catName(x.name, 'en')) === a); if (s) return { id: s.id, world: m.world } }
    return null
  }
  const parse = () => text.split('\n').map((l) => l.trim()).filter(Boolean).map((l, i) => {
    const [code, name, cat, img] = l.split(/[;\t]/).map((x) => x?.trim() ?? '')
    const c = findCat(cat ?? '')
    return { i: i + 1, code, name, cat, img, c, err: !code ? 'Kod boş' : !name ? 'Ad boş' : !c ? `Kategori bulunamadı: “${cat}”` : '' }
  })
  const rows = open ? parse() : []
  const bad = rows.filter((r) => r.err)

  async function run() {
    if (!rows.length || bad.length) return
    setBusy(true)
    try {
      const existing = await getRows('site_products')
      let sort = existing.reduce((m, r) => Math.max(m, r.sort ?? 0), -1) + 1
      for (const r of rows) {
        const id = r.code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const old = existing.find((x) => x.id === id)
        await api('POST', '/api/site', { action: 'upsert', table: 'site_products', row: { id, code: r.code, name_key: r.name, cat_key: r.c!.id, world: r.c!.world, img: r.img || old?.img || '', sort: old?.sort ?? sort++, active: true } })
      }
      say(`${rows.length} ürün yüklendi.`); setText(''); setOpen(false); setTimeout(() => location.reload(), 600)
    } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }

  return (
    <div className="card" style={{ marginBottom: 14, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <b>Toplu ürün yükleme</b>
        <span style={{ color: 'var(--tx3)', fontSize: 12.5 }}>Excel’den kopyalayıp yapıştırın, yüzlerce ürünü tek seferde ekleyin.</span>
        <button className="btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => setOpen(!open)}>{open ? 'Kapat' : 'Aç'}</button>
      </div>
      {open && (
        <>
          <Label>Her satır bir ürün: <b>kod ; ad ; kategori ; görsel (isteğe bağlı)</b>. Kategori “Alt kategori” ya da “Ana › Alt” yazılabilir (ör. <i>Mutfak ve sofra › Tepsi</i>). Excel’den yapıştırırsanız sütunlar sekmeyle ayrılır, o da çalışır. Aynı kodlu ürün güncellenir.</Label>
          <textarea className="inp" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={'1300-A ; Ekmek kutusu ; Mutfak ve sofra › Ekmek kutusu\n5067 ; Saksı ; Bahçe › Saksı'} />
          {rows.length > 0 && <div style={{ margin: '10px 0', fontSize: 13 }}><b>{rows.length}</b> satır, <b style={{ color: bad.length ? 'var(--red)' : 'var(--green)' }}>{bad.length} hatalı</b>{bad.slice(0, 6).map((r) => <div key={r.i} style={{ color: 'var(--red)' }}>Satır {r.i}: {r.err}</div>)}</div>}
          <button className="btn" disabled={busy || !rows.length || !!bad.length} onClick={run}>{busy ? 'Yükleniyor…' : `${rows.length || ''} ürünü yükle`}</button>
          <div style={{ color: 'var(--tx3)', fontSize: 12, marginTop: 8 }}>Görselleri sonradan Medya’ya yükleyip ürün düzenleme ekranından seçebilirsiniz.</div>
        </>
      )}
    </div>
  )
}

export default function Page() {
  return <ListManager cfg={{
    table: 'site_products', pk: 'id', title: 'Ürünler', sub: 'Tüm ürünler bayi kataloğunda görünür. Ana sayfadaki kayan şerit listedeki ilk 12 ürünü gösterir; sırayı ↑↓ ile değiştirin.', singular: 'ürün', imgKey: 'img',
    defaults: { id: '', code: '', name_key: '', cat_key: '', world: 'home', img: '', active: true },
    autoId: (r) => String(r.code ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `u-${Date.now().toString(36)}`,
    extra: <Bulk />,
    head: (r, tr) => `${r.code} · ${tr(r.name_key)}`,
    meta: (r, tr) => { const c = resolveCat(DEFAULT_CATEGORIES, r.cat_key); return <><Pill tone="ac">{r.world === 'garden' ? 'Bahçe' : 'Ev'}</Pill><span>{c.main ? `${catName(c.main.name, 'tr')}${c.sub ? ' › ' + catName(c.sub.name, 'tr') : ''}` : tr(r.cat_key)}</span></> },
    fields: [{ k: 'code', l: 'Ürün kodu' }, { k: 'name_key', l: 'Ürün adı', help: 'Her dilde aynı görünür. Çeviri isterseniz Metinler’de bir anahtar oluşturup adı yerine anahtarı yazın.' }, { k: 'cat_key', l: 'Kategori', t: 'cat' }, { k: 'world', l: 'Bölüm', t: 'world' }, { k: 'img', l: 'Görsel', t: 'img' }, { k: 'active', l: 'Yayında', t: 'bool' }],
  }} />
}
