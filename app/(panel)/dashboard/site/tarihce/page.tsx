'use client'
import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react'
import { ImageField, LANGS, LANG_NAMES, Label, Modal, PageHead, Pill, api, getRows, useToast, type Row } from '@panel/components/site/ui'

const blank = (n: number): Row => ({ year: '', title: {}, body: {}, img: '', sort: n, active: true })

export default function Page() {
  const say = useToast()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [edit, setEdit] = useState<Row | null>(null)
  const [busy, setBusy] = useState(false)
  const [lang, setLang] = useState<string>('tr')

  const load = useCallback(() => { getRows('site_history').then((r) => setRows(r.sort((a, b) => a.sort - b.sort))).catch((e) => say(/site_history/.test(e.message) ? 'Tarihçe tablosu henüz kurulmamış (migration 0005 uygulanmalı).' : e.message)) }, [say])
  useEffect(() => { load() }, [load])

  async function save() {
    if (!edit) return
    if (!String(edit.year).trim()) return say('Yıl / dönem boş olamaz.')
    setBusy(true)
    try { await api('POST', '/api/site', { action: 'upsert', table: 'site_history', row: edit }); say('Kaydedildi, site güncellendi.'); setEdit(null); load() } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }
  async function del(r: Row) {
    if (!confirm(`${r.year} kaydı silinsin mi?`)) return
    try { await api('POST', '/api/site', { action: 'delete', table: 'site_history', row: { id: r.id } }); load() } catch (e: any) { say(e.message) }
  }
  async function move(i: number, d: -1 | 1) {
    const list = [...(rows ?? [])]; const j = i + d
    if (j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    try { await Promise.all(list.map((x, n) => (x.sort !== n ? api('POST', '/api/site', { action: 'upsert', table: 'site_history', row: { ...x, sort: n } }) : null))); load() } catch (e: any) { say(e.message) }
  }
  const setL = (k: 'title' | 'body', v: string) => setEdit((e) => ({ ...e!, [k]: { ...e![k], [lang]: v } }))

  return (
    <>
      <PageHead title="Tarihçe" sub="Sitedeki çizgisel zaman çizelgesi. Kayıtlar yukarıdan aşağıya, listedeki sırayla gösterilir."
        action={<button className="btn" onClick={() => setEdit(blank(rows?.length ?? 0))}>+ Yeni kayıt</button>} />
      <div className="card">
        {!rows && <div style={{ padding: 22, color: 'var(--tx3)' }}>Yükleniyor…</div>}
        {rows && !rows.length && <div style={{ padding: 22, color: 'var(--tx3)' }}>Henüz kayıt yok. “Yeni kayıt” ile ilk yılı ekleyin.</div>}
        {rows?.map((r, i) => (
          <div key={r.id} className="row" style={{ alignItems: 'center', gap: 14, opacity: r.active === false ? 0.55 : 1 }}>
            <b style={{ minWidth: 110 }}>{r.year}</b>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{r.title?.tr || <span style={{ color: 'var(--tx3)' }}>Türkçe başlık yok</span>} {r.active === false && <Pill tone="warn">Gizli</Pill>}</div>
              {r.body?.tr && <div style={{ color: 'var(--tx3)', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.body.tr}</div>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-ghost" aria-label="Yukarı" onClick={() => move(i, -1)}><ArrowUp size={14} /></button>
              <button className="btn-ghost" aria-label="Aşağı" onClick={() => move(i, 1)}><ArrowDown size={14} /></button>
              <button className="btn-ghost" onClick={() => setEdit(structuredClone(r))}><Pencil size={14} /> Düzenle</button>
              <button className="btn-ghost" aria-label="Sil" onClick={() => del(r)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      {edit && (
        <Modal title={edit.id ? `${edit.year} kaydı` : 'Yeni tarihçe kaydı'} onClose={() => setEdit(null)}
          footer={<><button className="btn-ghost" onClick={() => setEdit(null)}>Vazgeç</button><button className="btn" disabled={busy} onClick={save}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button></>}>
          <Label>Yıl / dönem (ör. 1951)</Label>
          <input className="inp" value={edit.year} onChange={(e) => setEdit({ ...edit, year: e.target.value })} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '16px 0 4px' }}>
            {LANGS.map((l) => <button key={l} className={lang === l ? 'btn' : 'btn-ghost'} onClick={() => setLang(l)}>{LANG_NAMES[l]}{!edit.title?.[l] ? ' •' : ''}</button>)}
          </div>
          <Label>Başlık ({LANG_NAMES[lang]})</Label>
          <input className="inp" value={edit.title?.[lang] ?? ''} onChange={(e) => setL('title', e.target.value)} />
          <Label>Açıklama ({LANG_NAMES[lang]}, isteğe bağlı)</Label>
          <textarea className="inp" rows={4} value={edit.body?.[lang] ?? ''} onChange={(e) => setL('body', e.target.value)} />
          <Label>Görsel (isteğe bağlı)</Label>
          <ImageField value={edit.img ?? ''} onChange={(v) => setEdit({ ...edit, img: v })} />
          <label style={{ display: 'block', marginTop: 14 }}><input type="checkbox" checked={edit.active !== false} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Sitede yayında</label>
          <div style={{ color: 'var(--tx3)', fontSize: 12, marginTop: 8 }}>• işareti, o dilde başlık girilmediğini gösterir; boşsa site Türkçeyi gösterir.</div>
        </Modal>
      )}
    </>
  )
}
