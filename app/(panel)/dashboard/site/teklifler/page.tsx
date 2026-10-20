'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Printer } from 'lucide-react'
import { Modal, PageHead, Pill, api, getRows, useToast, type Row } from '@panel/components/site/ui'

const STAGES: [string, string, 'ac' | 'warn' | 'ok' | 'bad' | 'mute'][] = [['new', 'Yeni', 'ac'], ['review', 'İncelemede', 'warn'], ['quoted', 'Fiyat verildi', 'mute'], ['won', 'Kazanıldı', 'ok'], ['lost', 'Kaybedildi', 'bad']]
const SYM: Record<string, string> = { TRY: '₺', USD: '$', EUR: '€' }
const money = (n: number, c: string) => `${n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${SYM[c] ?? c}`

export default function Page() {
  const say = useToast()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [tab, setTab] = useState('all')
  const [open, setOpen] = useState<Row | null>(null)
  const [f, setF] = useState({ stage: 'new', quote_amount: '', quote_currency: 'TRY', internal_note: '' })

  const load = useCallback(() => { getRows('submissions').then((r) => setRows(r.filter((x) => Array.isArray(x.items) && x.items.length))).catch((e) => say(e.message)) }, [say])
  useEffect(() => { load() }, [load])
  const stage = (r: Row) => r.stage || 'new'
  const list = useMemo(() => (rows ?? []).filter((r) => tab === 'all' || stage(r) === tab), [rows, tab])
  const sum = (s: string) => (rows ?? []).filter((r) => stage(r) === s && r.quote_amount != null).reduce<Record<string, number>>((a, r) => { a[r.quote_currency] = (a[r.quote_currency] ?? 0) + Number(r.quote_amount); return a }, {})

  function show(r: Row) { setOpen(r); setF({ stage: stage(r), quote_amount: r.quote_amount == null ? '' : String(r.quote_amount), quote_currency: r.quote_currency || 'TRY', internal_note: r.internal_note || '' }) }
  async function save() {
    if (!open) return
    try { await api('POST', '/api/site', { action: 'quote', row: { id: open.id, ...f } }); say('Teklif güncellendi.'); setOpen(null); load() } catch (e: any) { say(e.message) }
  }
  const wa = (r: Row) => { const n = String(r.phone || '').replace(/\D/g, '').replace(/^0/, '90'); return n ? `https://wa.me/${n}` : '' }

  return (
    <>
      <style>{`@media print{body *{visibility:hidden}.qprint,.qprint *{visibility:visible}.qprint{position:absolute;left:0;top:0;width:100%;padding:24px;color:#000;background:#fff}}`}</style>
      <PageHead title="Teklifler" sub="Bayilerin katalogdan gönderdiği teklif talepleri. Aşamayı, tutarı ve iç notu buradan takip edin." />
      <div className="card" style={{ padding: '12px 20px', marginBottom: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {STAGES.map(([k, l]) => { const s = sum(k); return <div key={k}><div style={{ color: 'var(--tx3)', fontSize: 12 }}>{l} ({(rows ?? []).filter((r) => stage(r) === k).length})</div><b>{Object.keys(s).length ? Object.entries(s).map(([c, v]) => money(v, c)).join(' + ') : '—'}</b></div> })}
      </div>
      <div className="card">
        <div className="card-h" style={{ gap: 6, flexWrap: 'wrap' }}>
          <button className={tab === 'all' ? 'btn' : 'btn-ghost'} onClick={() => setTab('all')}>Tümü ({rows?.length ?? 0})</button>
          {STAGES.map(([k, l]) => <button key={k} className={tab === k ? 'btn' : 'btn-ghost'} onClick={() => setTab(k)}>{l}</button>)}
        </div>
        {!rows && <div style={{ padding: 22, color: 'var(--tx3)' }}>Yükleniyor…</div>}
        {rows && !list.length && <div style={{ padding: 22, color: 'var(--tx3)' }}>Teklif talebi yok.</div>}
        {list.map((r) => {
          const st = STAGES.find((s) => s[0] === stage(r))!
          return (
            <button key={r.id} className="row" onClick={() => show(r)} style={{ width: '100%', background: 'none', border: 0, borderBottom: '1px solid var(--bdr)', color: 'inherit', textAlign: 'left', cursor: 'pointer', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{r.company || r.name} <Pill tone={st[2]}>{st[1]}</Pill></div>
                <div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>{r.items.length} kalem · {r.items.reduce((n: number, i: Row) => n + (i.qty || 0), 0)} adet{r.quote_amount != null ? ` · ${money(Number(r.quote_amount), r.quote_currency)}` : ''}</div>
              </div>
              <small style={{ color: 'var(--tx3)' }}>{new Date(r.created_at).toLocaleDateString('tr-TR')}</small>
            </button>
          )
        })}
      </div>
      {open && (
        <Modal title={`Teklif — ${open.company || open.name}`} wide onClose={() => setOpen(null)}
          footer={<><button className="btn-ghost" onClick={() => window.print()}><Printer size={14} /> Yazdır / PDF</button><button className="btn" onClick={save}>Kaydet</button></>}>
          <div className="qprint">
            <h3 style={{ margin: '0 0 4px' }}>Aras Metal — Fiyat Teklifi</h3>
            <div style={{ color: 'var(--tx3)', fontSize: 13, marginBottom: 12 }}>{open.company} · {open.name} · {open.email}{open.phone ? ` · ${open.phone}` : ''} · {new Date(open.created_at).toLocaleDateString('tr-TR')}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--bdr)' }}><th>Kod</th><th>Ürün</th><th>Adet</th><th>Liste fiyatı</th></tr></thead>
              <tbody>{open.items.map((i: Row, n: number) => <tr key={n} style={{ borderBottom: '1px solid var(--bdr)' }}><td style={{ padding: '6px 0' }}>{i.code}</td><td>{i.name}</td><td>{i.qty}</td><td>{i.price != null ? money(i.price * 1, i.currency || 'TRY') : '—'}</td></tr>)}</tbody>
            </table>
            {String(open.message || '').includes('Not:') && <p style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{String(open.message).slice(String(open.message).indexOf('Not:'))}</p>}
            {f.quote_amount !== '' && <p style={{ fontSize: 16, marginTop: 12 }}><b>Teklif tutarı: {money(Number(f.quote_amount) || 0, f.quote_currency)}</b> <small style={{ color: 'var(--tx3)' }}>(KDV hariç)</small></p>}
          </div>
          <div style={{ display: 'grid', gap: 10, marginTop: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
            <label>Aşama<select className="inp" style={{ width: '100%' }} value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })}>{STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
            <label>Teklif tutarı<input className="inp" style={{ width: '100%' }} inputMode="decimal" value={f.quote_amount} onChange={(e) => setF({ ...f, quote_amount: e.target.value.replace(',', '.') })} /></label>
            <label>Para birimi<select className="inp" style={{ width: '100%' }} value={f.quote_currency} onChange={(e) => setF({ ...f, quote_currency: e.target.value })}>{['TRY', 'USD', 'EUR'].map((c) => <option key={c}>{c}</option>)}</select></label>
          </div>
          <label style={{ display: 'block', marginTop: 10 }}>İç not (bayi görmez)<textarea className="inp" rows={3} style={{ width: '100%' }} value={f.internal_note} onChange={(e) => setF({ ...f, internal_note: e.target.value })} /></label>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <a className="btn-ghost" href={`mailto:${open.email}`}>E-posta aç</a>
            {wa(open) && <a className="btn-ghost" href={wa(open)} target="_blank" rel="noopener">WhatsApp</a>}
            {open.phone && <a className="btn-ghost" href={`tel:${open.phone}`}>Ara</a>}
          </div>
        </Modal>
      )}
    </>
  )
}
