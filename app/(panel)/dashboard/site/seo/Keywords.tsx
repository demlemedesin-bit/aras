'use client'
import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PageHead, api, getRows, useToast, type Row } from '@panel/components/site/ui'

export default function Keywords() {
  const say = useToast()
  const [rows, setRows] = useState<Row[]>([])
  const [f, setF] = useState({ keyword: '', page: '/', position: '', volume: '', note: '' })
  const load = useCallback(() => getRows('site_seo_keywords').then(setRows).catch((e) => say(e.message)), [say])
  useEffect(() => { load() }, [load])

  async function add() {
    if (!f.keyword.trim()) return say('Kelime yazın')
    try {
      await api('POST', '/api/site', { action: 'upsert', table: 'site_seo_keywords', row: { keyword: f.keyword.trim(), page: f.page.trim() || '/', position: f.position ? Number(f.position) : null, volume: f.volume ? Number(f.volume) : null, note: f.note.trim() || null } })
      setF({ keyword: '', page: '/', position: '', volume: '', note: '' }); load()
    } catch (e: any) { say(e.message) }
  }
  async function pos(r: Row, v: string) {
    const n = v ? Number(v) : null
    if (n === r.position) return
    try { await api('POST', '/api/site', { action: 'upsert', table: 'site_seo_keywords', row: { ...r, prev_position: r.position, position: n, updated_at: new Date().toISOString() } }); load() } catch (e: any) { say(e.message) }
  }
  async function del(r: Row) { try { await api('POST', '/api/site', { action: 'delete', table: 'site_seo_keywords', row: { id: r.id } }); load() } catch (e: any) { say(e.message) } }

  const trend = (r: Row) => {
    if (r.position == null || r.prev_position == null) return <span style={{ color: 'var(--tx3)' }}>–</span>
    const d = r.prev_position - r.position
    return d === 0 ? <span style={{ color: 'var(--tx3)' }}>=</span> : <span style={{ color: d > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{d > 0 ? '▲' : '▼'} {Math.abs(d)}</span>
  }
  const top3 = rows.filter((r) => r.position && r.position <= 3).length
  const top10 = rows.filter((r) => r.position && r.position <= 10).length

  return (
    <>
      <PageHead title="Anahtar kelime takibi" sub="Hangi kelimede Google’da kaçıncı sıradasınız? Search Console’dan veya aramadan baktığınız sırayı girin; değişimi burada izleyin." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 18 }}>
        <div className="kpi"><span className="kpi-label">Takip edilen kelime</span><div className="kpi-value">{rows.length}</div></div>
        <div className="kpi"><span className="kpi-label">İlk 3’te</span><div className="kpi-value">{top3}</div></div>
        <div className="kpi"><span className="kpi-label">İlk 10’da</span><div className="kpi-value">{top10}</div></div>
      </div>
      <div className="card">
        <div className="card-h"><span className="card-title">Yeni kelime</span></div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '2fr 1.2fr .8fr .8fr 1.5fr auto', gap: 8, alignItems: 'center' }}>
          <input className="inp" placeholder="ör. galvaniz saksı toptan" value={f.keyword} onChange={(e) => setF({ ...f, keyword: e.target.value })} />
          <input className="inp" placeholder="Sayfa (/)" value={f.page} onChange={(e) => setF({ ...f, page: e.target.value })} />
          <input className="inp" type="number" placeholder="Sıra" value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} />
          <input className="inp" type="number" placeholder="Aylık arama" value={f.volume} onChange={(e) => setF({ ...f, volume: e.target.value })} />
          <input className="inp" placeholder="Not" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
          <button className="btn" onClick={add}><Plus size={14} /> Ekle</button>
        </div>
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr>{['Kelime', 'Sayfa', 'Sıra', 'Değişim', 'Aylık arama', 'Not', 'Güncelleme', ''].map((h) => <th key={h} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 11.5, color: 'var(--tx3)', borderBottom: '1px solid var(--bdr)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={8} style={{ padding: 18, color: 'var(--tx3)' }}>Henüz kelime eklenmedi</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--bdr)' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 600 }}>{r.keyword}</td>
                  <td style={{ padding: '9px 14px' }}>{r.page}</td>
                  <td style={{ padding: '9px 14px' }}><input className="inp" type="number" style={{ width: 80, padding: '5px 8px' }} defaultValue={r.position ?? ''} onBlur={(e) => pos(r, e.target.value)} /></td>
                  <td style={{ padding: '9px 14px' }}>{trend(r)}</td>
                  <td style={{ padding: '9px 14px' }}>{r.volume ?? '–'}</td>
                  <td style={{ padding: '9px 14px', color: 'var(--tx3)' }}>{r.note}</td>
                  <td style={{ padding: '9px 14px', color: 'var(--tx3)' }}>{new Date(r.updated_at).toLocaleDateString('tr-TR')}</td>
                  <td style={{ padding: '9px 14px' }}><button className="btn-ghost" onClick={() => del(r)} aria-label="Sil"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
