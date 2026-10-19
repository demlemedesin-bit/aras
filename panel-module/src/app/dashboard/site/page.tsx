'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import TopBar from '@/components/TopBar'

const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'it'] as const
type Row = Record<string, any>
type Field = { k: string; l: string; t?: 'text' | 'num' | 'bool' | 'img' | 'list' | 'world' | 'i18n' | 'json'; ro?: boolean }
type Tab = { id: string; label: string; table: string; pk: string[]; fields: Field[]; title: (r: Row) => string; defaults?: Row; auto?: string[] }

const TABS: Tab[] = [
  { id: 'texts', label: 'Metinler', table: 'site_texts', pk: ['ns', 'key'], title: (r) => `${r.ns}.${r.key}`, fields: [] },
  { id: 'collections', label: 'Koleksiyonlar', table: 'site_collections', pk: ['id'], title: (r) => r.id, defaults: { world: 'home', count: 0, sort: 0, active: true, subs: [] },
    fields: [{ k: 'id', l: 'Kimlik (değişmez)' }, { k: 'world', l: 'Bölüm', t: 'world' }, { k: 'title_key', l: 'Başlık metin anahtarı' }, { k: 'desc_key', l: 'Açıklama metin anahtarı' }, { k: 'href', l: 'Bağlantı' }, { k: 'img', l: 'Görsel', t: 'img' }, { k: 'pos', l: 'Görsel konumu (CSS)' }, { k: 'count', l: 'Ürün sayısı', t: 'num' }, { k: 'subs', l: 'Alt başlık anahtarları (virgülle)', t: 'list' }, { k: 'sort', l: 'Sıra', t: 'num' }, { k: 'active', l: 'Yayında', t: 'bool' }] },
  { id: 'products', label: 'Ürünler', table: 'site_products', pk: ['id'], title: (r) => `${r.code}`, defaults: { world: 'home', sort: 0, active: true },
    fields: [{ k: 'id', l: 'Kimlik (değişmez)' }, { k: 'code', l: 'Ürün kodu' }, { k: 'name_key', l: 'Ad metin anahtarı' }, { k: 'cat_key', l: 'Kategori metin anahtarı' }, { k: 'world', l: 'Bölüm', t: 'world' }, { k: 'img', l: 'Görsel', t: 'img' }, { k: 'href', l: 'Bağlantı' }, { k: 'sort', l: 'Sıra', t: 'num' }, { k: 'active', l: 'Yayında', t: 'bool' }] },
  { id: 'groups', label: 'Galeri grupları', table: 'site_gallery_groups', pk: ['id'], title: (r) => r.id, defaults: { sort: 0, active: true },
    fields: [{ k: 'id', l: 'Kimlik (değişmez)' }, { k: 'label_key', l: 'Başlık metin anahtarı' }, { k: 'sort', l: 'Sıra', t: 'num' }, { k: 'active', l: 'Yayında', t: 'bool' }] },
  { id: 'gallery', label: 'Galeri görselleri', table: 'site_gallery_images', pk: ['id'], title: (r) => `${r.group_id} #${r.id}`, defaults: { sort: 0, active: true, alt: {} },
    fields: [{ k: 'group_id', l: 'Grup kimliği' }, { k: 'src', l: 'Görsel', t: 'img' }, { k: 'alt', l: 'Alternatif metin (dil bazlı)', t: 'i18n' }, { k: 'sort', l: 'Sıra', t: 'num' }, { k: 'active', l: 'Yayında', t: 'bool' }] },
  { id: 'news', label: 'Haberler', table: 'site_news', pk: ['id'], title: (r) => r.head_key, defaults: { sort: 0, active: true, award: false },
    fields: [{ k: 'href', l: 'Bağlantı' }, { k: 'head_key', l: 'Başlık metin anahtarı' }, { k: 'date_key', l: 'Tarih metin anahtarı' }, { k: 'year', l: 'Yıl (tarih yerine)' }, { k: 'badge_key', l: 'Rozet metin anahtarı' }, { k: 'award', l: 'Ödül', t: 'bool' }, { k: 'sort', l: 'Sıra', t: 'num' }, { k: 'active', l: 'Yayında', t: 'bool' }] },
  { id: 'partners', label: 'İş ortakları', table: 'site_partners', pk: ['id'], title: (r) => r.name, defaults: { sort: 0, active: true },
    fields: [{ k: 'name', l: 'Ad' }, { k: 'href', l: 'Bağlantı' }, { k: 'img', l: 'Logo', t: 'img' }, { k: 'sort', l: 'Sıra', t: 'num' }, { k: 'active', l: 'Yayında', t: 'bool' }] },
  { id: 'settings', label: 'Ayarlar', table: 'site_settings', pk: ['key'], title: (r) => r.key, fields: [] },
  { id: 'inbox', label: 'Mesajlar', table: 'submissions', pk: ['id'], title: (r) => r.name, fields: [] },
]

const call = async (method: string, url: string, body?: any) => {
  const r = await fetch(url, { method, headers: body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || r.statusText)
  return j
}
const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box' }

export default function SitePage() {
  const [tab, setTab] = useState(TABS[0])
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState<Row | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const say = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3500) }

  const load = useCallback(async () => {
    setRows([]); setEdit(null)
    try { setRows((await call('GET', `/api/site?table=${tab.table}`)).rows) } catch (e: any) { say(e.message) }
  }, [tab])
  useEffect(() => { load() }, [load])

  const shown = useMemo(() => rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase())), [rows, q])

  async function save() {
    if (!edit) return
    setBusy(true)
    try {
      const row = { ...edit }
      for (const f of tab.fields) if (f.t === 'num') row[f.k] = Number(row[f.k] ?? 0)
      const j = await call('POST', '/api/site', { action: 'upsert', table: tab.table, row })
      say(j.revalidated === false ? 'Kaydedildi (site 5 dk içinde güncellenir)' : 'Kaydedildi, site güncellendi')
      await load()
    } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }
  async function del(r: Row) {
    if (!confirm('Silinsin mi?')) return
    try { await call('POST', '/api/site', { action: 'delete', table: tab.table, row: r }); say('Silindi'); await load() } catch (e: any) { say(e.message) }
  }
  async function upload(file: File, k: string) {
    const fd = new FormData(); fd.append('file', file)
    try { const j = await call('POST', '/api/site', fd); setEdit((e) => ({ ...e!, [k]: j.path })) } catch (e: any) { say(e.message) }
  }

  const newRow = () => {
    setIsNew(true)
    setEdit(tab.id === 'texts' ? { ns: 't', key: '', value: {} } : tab.id === 'settings' ? { key: '', value: {} } : { ...(tab.defaults ?? {}) })
  }
  const set = (k: string, v: any) => setEdit((e) => ({ ...e!, [k]: v }))

  const field = (f: Field) => {
    const v = edit![f.k]
    const lock = f.k === 'id' && !isNew
    if (f.t === 'bool') return <label><input type="checkbox" checked={!!v} onChange={(e) => set(f.k, e.target.checked)} /> {f.l}</label>
    return (
      <div key={f.k}>
        <div style={{ fontSize: 12, color: 'var(--tx3)', margin: '10px 0 4px' }}>{f.l}</div>
        {f.t === 'world' ? <select className="inp" value={v} onChange={(e) => set(f.k, e.target.value)}><option value="home">Ev</option><option value="garden">Bahçe</option></select>
          : f.t === 'num' ? <input type="number" value={v ?? 0} onChange={(e) => set(f.k, e.target.value)} style={inp} />
          : f.t === 'list' ? <input className="inp" value={(v ?? []).join(',')} onChange={(e) => set(f.k, e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
          : f.t === 'i18n' ? LANGS.map((l) => <input key={l} className="inp" style={{ marginBottom: 4 }} placeholder={l} value={v?.[l] ?? ''} onChange={(e) => set(f.k, { ...(v ?? {}), [l]: e.target.value })} />)
          : f.t === 'img' ? <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="inp" value={v ?? ''} onChange={(e) => set(f.k, e.target.value)} />
              <label className="btn-ghost" style={{ cursor: 'pointer' }}>Yükle<input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], f.k)} /></label>
            </div>
          : <input className="inp" value={v ?? ''} disabled={lock} onChange={(e) => set(f.k, e.target.value)} />}
      </div>
    )
  }

  return (
    <>
      <TopBar title="Site Yönetimi" subtitle="arasmetal.com" action={tab.id !== 'inbox' && <button className="btn" onClick={newRow}>Yeni</button>} />
      <div style={{ padding: 20, display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TABS.map((t) => <button key={t.id} className={t.id === tab.id ? 'btn' : 'btn-ghost'} onClick={() => { setTab(t); setQ('') }}>{t.label}</button>)}
        </div>
        <input className="inp" placeholder="Ara…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="card">
          {shown.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--bdr)', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{tab.title(r)}{r.active === false && <span style={{ color: 'var(--amber)', marginLeft: 8, fontSize: 11 }}>gizli</span>}</div>
                <div style={{ fontSize: 12, color: 'var(--tx3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tab.id === 'texts' ? r.value?.tr ?? r.value?.en : tab.id === 'inbox' ? `${r.email} · ${r.message}` : tab.id === 'settings' ? JSON.stringify(r.value) : r.img ?? r.src ?? r.href}
                </div>
              </div>
              {tab.id !== 'inbox' && <button className="btn-ghost" onClick={() => { setIsNew(false); setEdit(structuredClone(r)) }}>Düzenle</button>}
              {tab.id === 'inbox' ? <small style={{ color: 'var(--tx3)' }}>{new Date(r.created_at).toLocaleString('tr-TR')}</small> : null}
              <button className="btn-danger" onClick={() => del(r)}>Sil</button>
            </div>
          ))}
          {!shown.length && <div style={{ padding: 20, color: 'var(--tx3)' }}>Kayıt yok</div>}
        </div>
      </div>

      {edit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={() => setEdit(null)}>
          <div className="card" style={{ width: 'min(640px,94vw)', maxHeight: '88vh', overflow: 'auto', padding: 20 }} onClick={(e) => e.stopPropagation()}>
            <div className="card-title" style={{ marginBottom: 8 }}>{isNew ? 'Yeni kayıt' : tab.title(edit)}</div>
            {tab.id === 'texts' ? (<>
              {isNew && <div style={{ display: 'flex', gap: 8 }}><input className="inp" style={{ maxWidth: 110 }} placeholder="t | ui | auth | meta" value={edit.ns} onChange={(e) => set('ns', e.target.value)} /><input className="inp" placeholder="anahtar (örn. hero.h)" value={edit.key} onChange={(e) => set('key', e.target.value)} /></div>}
              {LANGS.map((l) => <div key={l}><div style={{ fontSize: 12, color: 'var(--tx3)', margin: '10px 0 4px' }}>{l.toUpperCase()}</div><textarea className="inp" rows={2} value={edit.value?.[l] ?? ''} onChange={(e) => set('value', { ...edit.value, [l]: e.target.value })} /></div>)}
            </>) : tab.id === 'settings' ? (<>
              {isNew && <input className="inp" placeholder="anahtar" value={edit.key} onChange={(e) => set('key', e.target.value)} />}
              <div style={{ fontSize: 12, color: 'var(--tx3)', margin: '10px 0 4px' }}>JSON · hero: showroom/home/garden görselleri · contact: tel, mail, harita, sosyal bağlantılar</div>
              <textarea className="inp" rows={14} style={{ fontFamily: 'monospace' }} defaultValue={JSON.stringify(edit.value, null, 2)} onChange={(e) => { try { set('value', JSON.parse(e.target.value)) } catch { /* yazarken geçersiz olabilir */ } }} />
              {edit.key === 'hero' && <label className="btn-ghost" style={{ cursor: 'pointer', marginTop: 8, display: 'inline-flex' }}>Görsel yükle (yolu kopyala)<input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const fd = new FormData(); fd.append('file', f); try { const j = await call('POST', '/api/site', fd); await navigator.clipboard.writeText(j.path); say(`Yüklendi: ${j.path} (panoya kopyalandı)`) } catch (er: any) { say(er.message) } }} /></label>}
            </>) : tab.fields.map(field)}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-ghost" onClick={() => setEdit(null)}>Vazgeç</button>
              <button className="btn" disabled={busy} onClick={save}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--s5)', color: 'var(--tx)', padding: '10px 16px', borderRadius: 10, zIndex: 60 }}>{toast}</div>}
    </>
  )
}
