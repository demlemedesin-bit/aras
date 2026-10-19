'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LANGS, LANG_NAMES, Label, Modal, PageHead, Pill, api, getRows, useToast, type Row } from '@panel/components/site/ui'

const SECTIONS: [string, RegExp][] = [
  ['Menü ve genel', /^(nav\.|skip|cta\.|unit|f\.all|tab\.|pre\.)/], ['Hero (ana görsel)', /^hero\./], ['Hakkımızda ve tarihçe', /^(v\.|tl\.|sp\.)/],
  ['Showroom', /^sr\./], ['Koleksiyonlar', /^(col\.|c\d\.|k\.)/], ['Galeri', /^gal\./], ['Ürünler', /^(prod\.|p\.|f\.kitchen)/],
  ['Çelik / sürdürülebilirlik', /^(eco\.|tag\.)/], ['Haberler ve ortaklar', /^(news\.|n\d\.|part\.)/], ['İletişim ve form', /^(ct\.|f\.)/], ['Alt bilgi', /^ft\./],
]
const sectionOf = (r: Row) => (r.ns !== 't' ? ({ ui: 'Arayüz etiketleri', auth: 'Bayi girişi', meta: 'SEO (başlık/açıklama)' } as Record<string, string>)[r.ns] ?? r.ns : SECTIONS.find(([, re]) => re.test(r.key))?.[0] ?? 'Diğer')
const missing = (r: Row) => LANGS.filter((l) => !(r.value?.[l] ?? '').trim()).length

export default function Page() {
  const say = useToast()
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState(''); const [sec, setSec] = useState(''); const [onlyMissing, setOnlyMissing] = useState(false)
  const [edit, setEdit] = useState<Row | null>(null); const [isNew, setIsNew] = useState(false); const [busy, setBusy] = useState(false)
  const load = useCallback(() => getRows('site_texts').then(setRows).catch((e) => say(e.message)), [say])
  useEffect(() => { load() }, [load])

  const groups = useMemo(() => {
    const m = new Map<string, Row[]>()
    for (const r of rows) {
      if (onlyMissing && !missing(r)) continue
      if (q && !(r.key + JSON.stringify(r.value)).toLowerCase().includes(q.toLowerCase())) continue
      const s = sectionOf(r); if (sec && s !== sec) continue
      m.set(s, [...(m.get(s) ?? []), r])
    }
    return [...m.entries()]
  }, [rows, q, sec, onlyMissing])
  const allSecs = useMemo(() => Array.from(new Set(rows.map(sectionOf))), [rows])
  const totalMissing = rows.filter((r) => missing(r)).length

  async function save() {
    if (!edit) return
    if (!edit.key?.trim()) return say('Anahtar boş olamaz')
    setBusy(true)
    try {
      const j = await api('POST', '/api/site', { action: 'upsert', table: 'site_texts', row: { ns: edit.ns, key: edit.key.trim(), value: edit.value } })
      say(j.revalidated === false ? 'Kaydedildi (site 5 dk içinde güncellenir)' : 'Kaydedildi, site güncellendi'); setEdit(null); await load()
    } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }
  async function del(r: Row) {
    if (!confirm(`${r.ns}.${r.key} silinsin mi? Sitede kullanılıyorsa varsayılan metne döner.`)) return
    try { await api('POST', '/api/site', { action: 'delete', table: 'site_texts', row: r }); await load() } catch (e: any) { say(e.message) }
  }

  return (
    <>
      <PageHead title="Metinler" sub={`Sitedeki tüm yazılar, 6 dilde. ${totalMissing ? `${totalMissing} metinde eksik çeviri var.` : 'Tüm çeviriler tam.'}`} action={<button className="btn" onClick={() => { setIsNew(true); setEdit({ ns: 't', key: '', value: {} }) }}>+ Yeni metin</button>} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="inp" style={{ maxWidth: 320 }} placeholder="Ara (anahtar veya metin)…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="inp" style={{ maxWidth: 240 }} value={sec} onChange={(e) => setSec(e.target.value)}><option value="">Tüm bölümler</option>{allSecs.map((s) => <option key={s}>{s}</option>)}</select>
        <label><input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} /> Yalnızca eksik çeviriler</label>
      </div>
      {groups.map(([name, list]) => (
        <div key={name} className="card" style={{ marginBottom: 14 }}>
          <div className="card-h"><span className="card-title">{name}</span><span className="card-meta">{list.length}</span></div>
          {list.map((r) => (
            <div key={r.ns + r.key} style={{ display: 'flex', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--bdr)', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(r.value?.tr ?? r.value?.en ?? '').replace(/<br>/g, ' / ')}</div>
                <code style={{ fontSize: 11, color: 'var(--tx3)' }}>{r.ns}.{r.key}</code>
              </div>
              {missing(r) > 0 && <Pill tone="warn">{missing(r)} dil eksik</Pill>}
              <button className="btn-ghost" onClick={() => { setIsNew(false); setEdit(structuredClone(r)) }}>Düzenle</button>
              <button className="btn-danger" onClick={() => del(r)}>Sil</button>
            </div>
          ))}
        </div>
      ))}
      {!groups.length && <div className="card" style={{ padding: 24, color: 'var(--tx3)' }}>Sonuç yok</div>}
      {edit && (
        <Modal title={isNew ? 'Yeni metin' : `${edit.ns}.${edit.key}`} onClose={() => setEdit(null)} wide
          footer={<><button className="btn-ghost" onClick={() => setEdit(null)}>Vazgeç</button><button className="btn" disabled={busy} onClick={save}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button></>}>
          {isNew && <div style={{ display: 'flex', gap: 8 }}>
            <select className="inp" style={{ maxWidth: 130 }} value={edit.ns} onChange={(e) => setEdit({ ...edit, ns: e.target.value })}><option value="t">Site metni</option><option value="ui">Arayüz</option><option value="auth">Bayi girişi</option><option value="meta">SEO</option></select>
            <input className="inp" placeholder="anahtar (örn. n6.h)" value={edit.key} onChange={(e) => setEdit({ ...edit, key: e.target.value })} />
          </div>}
          {LANGS.map((l) => (
            <div key={l}><Label>{LANG_NAMES[l]} {!(edit.value?.[l] ?? '').trim() && <Pill tone="warn">boş</Pill>}</Label>
              <textarea className="inp" rows={String(edit.value?.[l] ?? '').length > 90 ? 4 : 2} value={edit.value?.[l] ?? ''} onChange={(e) => setEdit({ ...edit, value: { ...edit.value, [l]: e.target.value } })} /></div>
          ))}
          <div style={{ fontSize: 11.5, color: 'var(--tx3)', marginTop: 10 }}>Satır atlamak için adreste <code>&lt;br&gt;</code> kullanılır. Boş bırakılan dil Türkçe metne düşer.</div>
        </Modal>
      )}
    </>
  )
}
