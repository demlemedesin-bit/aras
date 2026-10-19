'use client'
import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { MediaPicker, preview, LANGS, LANG_NAMES, Label, PageHead, api, getRows, useToast, type Row } from '@panel/components/site/ui'
import { DEFAULT_CATEGORIES, catName, type Cat } from '@/lib/categories'

const slug = (s: string) => s.toLowerCase().replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
function Photos({ photos, onChange }: { photos: string[]; onChange: (p: string[]) => void }) {
  const say = useToast(); const [busy, setBusy] = useState(false); const [pick, setPick] = useState(false)
  async function up(files: FileList) {
    setBusy(true)
    try { const add: string[] = []; for (const f of Array.from(files)) { const fd = new FormData(); fd.append('file', f); add.push((await api('POST', '/api/site', fd)).path) } onChange([...photos, ...add]) } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {photos.map((u, i) => (
        <div key={u + i} style={{ position: 'relative' }} title={i === 0 ? 'Kapak görseli' : ''}>
          <div style={{ width: 62, height: 62, borderRadius: 8, background: `var(--s3) center/cover url(${preview(u)})`, border: i === 0 ? '2px solid var(--ac, #2a6)' : '1px solid var(--bdr)' }} />
          <div style={{ position: 'absolute', top: -6, right: -6, display: 'flex', gap: 2 }}>
            {i > 0 && <button type="button" className="btn-ghost" style={{ padding: '0 5px', fontSize: 11 }} aria-label="Sola al" onClick={() => onChange(mv(photos, i, -1))}>‹</button>}
            <button type="button" className="btn-danger" style={{ padding: '0 5px', fontSize: 11 }} aria-label="Kaldır" onClick={() => onChange(photos.filter((_, j) => j !== i))}>×</button>
          </div>
        </div>
      ))}
      <label className="btn-ghost" style={{ cursor: 'pointer' }}>{busy ? '…' : '+ Yükle'}<input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files?.length && up(e.target.files)} /></label>
      <button type="button" className="btn-ghost" onClick={() => setPick(true)}>Kütüphane</button>
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(p) => { onChange([...photos, p]); setPick(false) }} />}
    </div>
  )
}

const mv = <T,>(a: T[], i: number, d: -1 | 1) => { const b = [...a]; const j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b }

export default function Page() {
  const say = useToast()
  const [tree, setTree] = useState<Cat[]>(DEFAULT_CATEGORIES)
  const [saved, setSaved] = useState(false)
  const [lang, setLang] = useState<string>('tr')
  const [busy, setBusy] = useState(false)
  const [counts, setCounts] = useState<Record<string, number>>({})

  const load = useCallback(() => {
    getRows('site_settings').then((r) => { const c = r.find((x) => x.key === 'categories')?.value; if (Array.isArray(c) && c.length) { setTree(c); setSaved(true) } else { api('POST', '/api/site', { action: 'upsert', table: 'site_settings', row: { key: 'categories', value: DEFAULT_CATEGORIES } }).then(() => { setSaved(true); say('Varsayılan ağaç ve görseller panele aktarıldı, artık buradan yönetebilirsiniz.') }).catch((e) => say(e.message)) } }).catch((e) => say(e.message))
    getRows('site_products').then((r) => { const m: Record<string, number> = {}; for (const p of r) m[p.cat_key] = (m[p.cat_key] ?? 0) + 1; setCounts(m) }).catch(() => {})
  }, [say])
  useEffect(() => { load() }, [load])

  const setMain = (i: number, patch: Partial<Cat>) => setTree((t) => t.map((m, j) => (j === i ? { ...m, ...patch } : m)))
  const setSub = (i: number, k: number, name: Row) => setTree((t) => t.map((m, j) => (j === i ? { ...m, subs: m.subs.map((s, l) => (l === k ? { ...s, name } : s)) } : m)))
  const nm = (o: Row | undefined) => o?.[lang] ?? ''

  async function save() {
    for (const m of tree) { if (!m.name.tr?.trim()) return say('Her kategorinin Türkçe adı olmalı.'); for (const s of m.subs) if (!s.name.tr?.trim()) return say(`${m.name.tr} altında Türkçe adı boş alt kategori var.`) }
    setBusy(true)
    try { await api('POST', '/api/site', { action: 'upsert', table: 'site_settings', row: { key: 'categories', value: tree } }); setSaved(true); say('Kaydedildi, site güncellendi.') } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }
  function reset() {
    if (!confirm('Tüm kategori ağacı varsayılana dönsün mü? Yaptığınız değişiklikler kaybolur.')) return
    setTree(structuredClone(DEFAULT_CATEGORIES))
  }
  const addMain = () => setTree([...tree, { id: `kat-${Date.now().toString(36)}`, world: 'home', name: {}, subs: [] }])
  const addSub = (i: number) => setTree((t) => t.map((m, j) => (j === i ? { ...m, subs: [...m.subs, { id: `${m.id}-${Date.now().toString(36)}`, name: {} }] } : m)))
  const total = (m: Cat) => (counts[m.id] ?? 0) + m.subs.reduce((n, s) => n + (counts[s.id] ?? 0), 0)

  return (
    <>
      <PageHead title="Kategoriler" sub="Ana kategori ve alt kategori ağacı. Bayi kataloğunda sol menü olarak görünür. Ürünleri Ürünler sayfasında bu kategorilere bağlarsınız."
        action={<div style={{ display: 'flex', gap: 8 }}><button className="btn-ghost" onClick={reset}><RotateCcw size={14} /> Varsayılana dön</button><button className="btn" disabled={busy} onClick={save}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button></div>} />
      <div className="card" style={{ padding: 14, marginBottom: 16, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {LANGS.map((l) => <button key={l} className={lang === l ? 'btn' : 'btn-ghost'} onClick={() => setLang(l)}>{LANG_NAMES[l]}</button>)}
        <span style={{ color: 'var(--tx3)', fontSize: 12.5, marginLeft: 8 }}>{saved ? 'Kayıtlı ağaç gösteriliyor.' : 'Henüz kaydedilmedi; varsayılan ağaç gösteriliyor. Kaydedince sizin sürümünüz geçerli olur.'} Boş bırakılan dil Türkçeye düşer.</span>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {tree.map((m, i) => (
          <div key={m.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input className="inp" style={{ flex: '1 1 220px', fontWeight: 600 }} placeholder={`Ana kategori adı (${LANG_NAMES[lang]})`} value={nm(m.name)} onChange={(e) => { const name = { ...m.name, [lang]: e.target.value }; setMain(i, { name, ...(lang === 'tr' && /^kat-/.test(m.id) ? { id: slug(e.target.value) || m.id } : {}) }) }} />
              <select className="inp" style={{ width: 120 }} value={m.world} onChange={(e) => setMain(i, { world: e.target.value as 'home' | 'garden' })}><option value="home">Ev</option><option value="garden">Bahçe</option></select>
              <span style={{ color: 'var(--tx3)', fontSize: 12.5 }}>{total(m)} ürün</span>
              <button className="btn-ghost" aria-label="Yukarı" onClick={() => setTree(mv(tree, i, -1))}><ArrowUp size={14} /></button>
              <button className="btn-ghost" aria-label="Aşağı" onClick={() => setTree(mv(tree, i, 1))}><ArrowDown size={14} /></button>
              <button className="btn-danger" aria-label="Sil" onClick={() => { if (!m.subs.length || confirm(`${catName(m.name, 'tr')} ve ${m.subs.length} alt kategorisi silinsin mi? Bağlı ürünler kategorisiz kalır.`)) setTree(tree.filter((_, j) => j !== i)) }}><Trash2 size={14} /></button>
            </div>
            <div style={{ margin: '12px 0 0' }}>
              <Label>Görseller (ilki kapak olur, ‹ ile öne al)</Label>
              <Photos photos={m.photos ?? []} onChange={(p) => setMain(i, { photos: p, img: p[0] })} />
            </div>
            <div style={{ margin: '12px 0 0 18px', paddingLeft: 14, borderLeft: '2px solid var(--bdr)', display: 'grid', gap: 8 }}>
              {m.subs.map((s, k) => (
                <div key={s.id} style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="inp" style={{ flex: 1 }} placeholder={`Alt kategori adı (${LANG_NAMES[lang]})`} value={nm(s.name)} onChange={(e) => setSub(i, k, { ...s.name, [lang]: e.target.value })} />
                  <span style={{ color: 'var(--tx3)', fontSize: 12.5, minWidth: 60 }}>{counts[s.id] ?? 0} ürün</span>
                  <button className="btn-ghost" aria-label="Yukarı" onClick={() => setMain(i, { subs: mv(m.subs, k, -1) })}><ArrowUp size={14} /></button>
                  <button className="btn-ghost" aria-label="Aşağı" onClick={() => setMain(i, { subs: mv(m.subs, k, 1) })}><ArrowDown size={14} /></button>
                  <button className="btn-danger" aria-label="Sil" onClick={() => setMain(i, { subs: m.subs.filter((_, l) => l !== k) })}><Trash2 size={14} /></button>
                </div>
                <Photos photos={s.photos ?? []} onChange={(p) => setMain(i, { subs: m.subs.map((x, l) => (l === k ? { ...x, photos: p, img: p[0] } : x)) })} />
                </div>
              ))}
              <div><button className="btn-ghost" onClick={() => addSub(i)}><Plus size={14} /> Alt kategori ekle</button></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}><button className="btn" onClick={addMain}><Plus size={14} /> Ana kategori ekle</button></div>
    </>
  )
}
