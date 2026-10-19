'use client'
import { useCallback, useEffect, useState } from 'react'
import { Modal, PageHead, Pill, api, getRows, useToast, type Row } from '@panel/components/site/ui'

const ST: Record<string, [string, 'ac' | 'warn' | 'ok']> = { new: ['Yeni', 'ac'], read: ['Okundu', 'warn'], done: ['Cevaplandı', 'ok'] }

export default function Page() {
  const say = useToast(); const [rows, setRows] = useState<Row[]>([]); const [f, setF] = useState(''); const [open, setOpen] = useState<Row | null>(null)
  const load = useCallback(() => getRows('submissions').then(setRows).catch((e) => say(e.message)), [say])
  useEffect(() => { load() }, [load])
  async function setStatus(r: Row, status: string) { try { await api('POST', '/api/site', { action: 'upsert', table: 'submissions', row: { id: r.id, status } }); setOpen((o) => (o ? { ...o, status } : o)); load() } catch (e: any) { say(e.message) } }
  async function del(r: Row) { if (!confirm('Mesaj silinsin mi?')) return; try { await api('POST', '/api/site', { action: 'delete', table: 'submissions', row: r }); setOpen(null); load() } catch (e: any) { say(e.message) } }
  const shown = rows.filter((r) => !f || r.status === f)
  return (
    <>
      <PageHead title="Mesajlar" sub="İletişim formundan gelenler." action={<select className="inp" value={f} onChange={(e) => setF(e.target.value)}><option value="">Tümü ({rows.length})</option>{Object.entries(ST).map(([k, [l]]) => <option key={k} value={k}>{l} ({rows.filter((r) => r.status === k).length})</option>)}</select>} />
      <div className="card">
        {shown.map((r) => (
          <button key={r.id} onClick={() => { setOpen(r); if (r.status === 'new') setStatus(r, 'read') }} style={{ display: 'flex', width: '100%', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--bdr)', background: 'none', border: 0, borderBlockEnd: '1px solid var(--bdr)', color: 'inherit', textAlign: 'left', cursor: 'pointer', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: r.status === 'new' ? 700 : 500 }}>{r.name}{r.company ? ` · ${r.company}` : ''} {r.topic === 'catalog' && <Pill tone="ok">Katalog talebi</Pill>}{r.topic === 'career' && <Pill tone="ac">Kariyer</Pill>}</div>
              <div style={{ color: 'var(--tx3)', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.message}</div>
            </div>
            <Pill tone={(ST[r.status] ?? ST.read)[1]}>{(ST[r.status] ?? ST.read)[0]}</Pill>
            <small style={{ color: 'var(--tx3)' }}>{new Date(r.created_at).toLocaleString('tr-TR')}</small>
          </button>
        ))}
        {!shown.length && <div style={{ padding: 24, color: 'var(--tx3)' }}>Mesaj yok</div>}
      </div>
      {open && (
        <Modal title={open.name} onClose={() => setOpen(null)}
          footer={<>
            <button className="btn-danger" onClick={() => del(open)}>Sil</button>
            {open.status !== 'done' && <button className="btn-ghost" onClick={() => setStatus(open, 'done')}>Cevaplandı işaretle</button>}
            <a className="btn" href={`mailto:${open.email}?subject=${encodeURIComponent('Aras Metal')}`} onClick={() => setStatus(open, 'done')}>E-posta ile yanıtla</a>
          </>}>
          <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginBottom: 12 }}>{open.email}{open.phone ? ` · ${open.phone}` : ''}{open.company ? ` · ${open.company}` : ''}{open.country ? ` · ${open.country}` : ''} · {open.topic === 'catalog' ? 'Katalog talebi' : open.topic === 'career' ? 'Kariyer başvurusu' : 'İletişim'} · {open.lang?.toUpperCase()} · {new Date(open.created_at).toLocaleString('tr-TR')}</div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{open.message}</div>
        </Modal>
      )}
    </>
  )
}
