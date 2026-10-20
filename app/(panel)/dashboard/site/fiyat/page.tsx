'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PageHead, Modal, api, getRows, useToast, type Row } from '@panel/components/site/ui'

type P = { price: string; currency: string; unit: string; stock: string; min_qty: string }
const EMPTY: P = { price: '', currency: 'TRY', unit: 'adet', stock: 'in', min_qty: '' }
const STOCK: Record<string, string> = { in: 'Stokta', low: 'Sınırlı', out: 'Tükendi', order: 'Siparişle' }

export default function Page() {
  const say = useToast()
  const [prods, setProds] = useState<Row[] | null>(null)
  const [vals, setVals] = useState<Record<string, P>>({})
  const [dirty, setDirty] = useState<Set<string>>(new Set())
  const [q, setQ] = useState('')
  const [imp, setImp] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [p, pr] = await Promise.all([getRows('site_products'), getRows('site_prices')])
      setProds(p)
      const m: Record<string, P> = {}
      for (const r of pr) m[r.product_id] = { price: r.price == null ? '' : String(r.price), currency: r.currency, unit: r.unit, stock: r.stock, min_qty: r.min_qty ? String(r.min_qty) : '' }
      setVals(m); setDirty(new Set())
    } catch (e: any) { say(e.message) }
  }, [say])
  useEffect(() => { load() }, [load])

  const set = (id: string, k: keyof P, v: string) => { setVals((m) => ({ ...m, [id]: { ...(m[id] ?? EMPTY), [k]: v } })); setDirty((d) => new Set(d).add(id)) }
  const list = useMemo(() => (prods ?? []).filter((p) => !q || `${p.code} ${p.id}`.toLowerCase().includes(q.toLowerCase())), [prods, q])

  async function save() {
    const rows = [...dirty].map((id) => ({ product_id: id, ...(vals[id] ?? EMPTY) }))
    if (!rows.length) return
    try { await api('POST', '/api/site', { action: 'prices', row: rows }); say(`${rows.length} ürünün fiyat/stok bilgisi kaydedildi.`); load() } catch (e: any) { say(e.message) }
  }
  async function importText() {
    const byCode = new Map((prods ?? []).map((p) => [String(p.code).toLowerCase(), p.id]))
    const rows: any[] = []; const miss: string[] = []
    for (const line of (imp ?? '').split('\n')) {
      const c = line.split(/[;\t,]/).map((x) => x.trim())
      if (!c[0]) continue
      const id = byCode.get(c[0].toLowerCase())
      if (!id) { miss.push(c[0]); continue }
      const stock = Object.entries(STOCK).find(([, l]) => l.toLowerCase() === (c[2] ?? '').toLowerCase())?.[0] ?? (['in', 'low', 'out', 'order'].includes(c[2]) ? c[2] : 'in')
      rows.push({ product_id: id, price: (c[1] ?? '').replace(',', '.'), currency: (c[3] || 'TRY').toUpperCase(), unit: 'adet', stock, min_qty: c[4] ?? '' })
    }
    if (!rows.length) return say('Eşleşen ürün kodu bulunamadı.')
    try { await api('POST', '/api/site', { action: 'prices', row: rows }); say(`${rows.length} satır işlendi.${miss.length ? ` Bulunamayan kodlar: ${miss.slice(0, 8).join(', ')}` : ''}`); setImp(null); load() } catch (e: any) { say(e.message) }
  }

  return (
    <>
      <PageHead title="Fiyat & Stok" sub="Yalnızca onaylı bayiler görür. Herkese açık sitede ve arama motorlarında hiçbir zaman görünmez. Fiyatı boş bırakırsanız yalnızca stok durumu gösterilir."
        action={<div style={{ display: 'flex', gap: 8 }}><button className="btn-ghost" onClick={() => setImp('')}>Toplu yapıştır</button><button className="btn" disabled={!dirty.size} onClick={save}>Kaydet{dirty.size ? ` (${dirty.size})` : ''}</button></div>} />
      <div className="card">
        <div className="card-h"><div style={{ position: 'relative' }}><Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--tx3)' }} /><input className="inp" style={{ paddingLeft: 30, width: 240 }} placeholder="Ürün kodu ara" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
        {!prods && <div style={{ padding: 22, color: 'var(--tx3)' }}>Yükleniyor…</div>}
        {prods && !prods.length && <div style={{ padding: 22, color: 'var(--tx3)' }}>Henüz ürün yok. Önce Ürünler sayfasından ekleyin veya toplu yükleyin.</div>}
        {list.map((p) => {
          const v = vals[p.id] ?? EMPTY
          return (
            <div key={p.id} className="row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center', background: dirty.has(p.id) ? 'color-mix(in srgb,var(--ac) 7%,transparent)' : undefined }}>
              <div style={{ flex: '1 1 180px', fontWeight: 600 }}>{p.code}<div style={{ fontWeight: 400, color: 'var(--tx3)', fontSize: 12 }}>{p.world === 'garden' ? 'Garden' : 'Home'}</div></div>
              <input className="inp" style={{ width: 110 }} inputMode="decimal" placeholder="Fiyat" value={v.price} onChange={(e) => set(p.id, 'price', e.target.value.replace(',', '.'))} />
              <select className="inp" style={{ width: 78 }} value={v.currency} onChange={(e) => set(p.id, 'currency', e.target.value)}>{['TRY', 'USD', 'EUR'].map((c) => <option key={c}>{c}</option>)}</select>
              <input className="inp" style={{ width: 80 }} value={v.unit} onChange={(e) => set(p.id, 'unit', e.target.value)} aria-label="Birim" />
              <select className="inp" style={{ width: 120 }} value={v.stock} onChange={(e) => set(p.id, 'stock', e.target.value)}>{Object.entries(STOCK).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              <input className="inp" style={{ width: 90 }} inputMode="numeric" placeholder="Min. adet" value={v.min_qty} onChange={(e) => set(p.id, 'min_qty', e.target.value.replace(/\D/g, ''))} />
            </div>
          )
        })}
      </div>
      {imp !== null && (
        <Modal title="Toplu fiyat yapıştır" onClose={() => setImp(null)} footer={<button className="btn" onClick={importText}>İçe aktar</button>}>
          <p style={{ color: 'var(--tx3)', fontSize: 13 }}>Her satır: <code>kod;fiyat;stok;para birimi;min adet</code> (Excel’den kopyalayıp yapıştırabilirsiniz). Stok: in, low, out, order veya Türkçe karşılığı. Son iki sütun isteğe bağlı.</p>
          <textarea className="inp" rows={10} style={{ width: '100%', fontFamily: 'monospace' }} value={imp} onChange={(e) => setImp(e.target.value)} placeholder={'AR-1001;125,50;in;TRY;50'} />
        </Modal>
      )}
    </>
  )
}
