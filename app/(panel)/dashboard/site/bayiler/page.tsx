'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, X, Trash2, Search, KeyRound } from 'lucide-react'
import { PageHead, Pill, api, getRows, useToast, type Row } from '@panel/components/site/ui'

const ST: Record<string, [string, 'ok' | 'warn' | 'bad']> = { pending: ['Onay bekliyor', 'warn'], approved: ['Onaylı', 'ok'], rejected: ['Reddedildi', 'bad'] }
const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

export default function Page() {
  const say = useToast()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [q, setQ] = useState('')
  const [auto, setAuto] = useState(false)

  const load = useCallback(() => { getRows('site_dealers').then(setRows).catch((e) => say(e.message)) }, [say])
  useEffect(() => { load() }, [load])
  useEffect(() => { getRows('site_settings').then((r) => setAuto(r.find((x) => x.key === 'dealers')?.value?.auto_approve === true)).catch(() => {}) }, [])

  const count = (s: string) => (rows ?? []).filter((r) => r.status === s).length
  const list = useMemo(() => (rows ?? []).filter((r) => (tab === 'all' || r.status === tab) && (!q || `${r.company} ${r.name} ${r.email}`.toLowerCase().includes(q.toLowerCase()))), [rows, tab, q])

  async function setStatus(r: Row, status: string) {
    try { await api('POST', '/api/site', { action: 'dealer', row: { id: r.id, status, note: r.note } }); say(status === 'approved' ? 'Firma onaylandı. Artık giriş yapabilir.' : status === 'rejected' ? 'Başvuru reddedildi.' : 'Beklemeye alındı.'); load() } catch (e: any) { say(e.message) }
  }
  async function remove(r: Row) {
    if (!confirm(`${r.company} kaydı silinsin mi? Bu işlem geri alınamaz.`)) return
    try { await api('POST', '/api/site', { action: 'delete', table: 'site_dealers', row: { id: r.id } }); say('Silindi.'); load() } catch (e: any) { say(e.message) }
  }
  async function resetPw(r: Row) {
    const gen = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 54]).join('')
    const pw = prompt(`${r.company} için yeni şifre (en az 8 karakter). Boş bırakırsanız otomatik oluşturulur:`, gen)
    if (pw === null) return
    const val = pw.trim() || gen
    if (val.length < 8) return say('Şifre en az 8 karakter olmalı.')
    try { await api('POST', '/api/site', { action: 'dealer-pw', row: { id: r.id, password: val } }); prompt('Şifre değişti. Bayiye iletin (bu pencere kapanınca tekrar görünmez):', val) } catch (e: any) { say(e.message) }
  }
  async function toggleAuto(v: boolean) {
    setAuto(v)
    try { await api('POST', '/api/site', { action: 'upsert', table: 'site_settings', row: { key: 'dealers', value: { auto_approve: v } } }); say(v ? 'Yeni başvurular otomatik onaylanacak.' : 'Yeni başvurular onayınızı bekleyecek.') } catch (e: any) { setAuto(!v); say(e.message) }
  }

  const TABS: [typeof tab, string][] = [['pending', `Bekleyen (${count('pending')})`], ['approved', `Onaylı (${count('approved')})`], ['rejected', `Reddedilen (${count('rejected')})`], ['all', `Tümü (${rows?.length ?? 0})`]]
  return (
    <>
      <PageHead title="Firmalar / Bayiler" sub="Sitedeki “Bayi girişi” ile kayıt olan firmalar. Onayladığınız firmalar koleksiyon ve ürün sayfalarını açabilir." />
      <div className="card" style={{ padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600 }}>
          <input type="checkbox" checked={auto} onChange={(e) => toggleAuto(e.target.checked)} /> Yeni başvuruları otomatik onayla
        </label>
        <span style={{ color: 'var(--tx3)', fontSize: 12.5 }}>Kapalıyken her başvuru sizin onayınızı bekler (önerilen).</span>
      </div>
      <div className="card">
        <div className="card-h" style={{ gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TABS.map(([k, l]) => <button key={k} className={tab === k ? 'btn' : 'btn-ghost'} onClick={() => setTab(k)}>{l}</button>)}
          </div>
          <div style={{ position: 'relative' }}><Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--tx3)' }} /><input className="inp" style={{ paddingLeft: 30, width: 220 }} placeholder="Firma, ad veya e-posta ara" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        {!rows && <div style={{ padding: 22, color: 'var(--tx3)' }}>Yükleniyor…</div>}
        {rows && !list.length && <div style={{ padding: 22, color: 'var(--tx3)' }}>{rows.length ? 'Bu filtrede kayıt yok.' : 'Henüz firma kaydı yok. Sitedeki “Üye ol” formundan gelen başvurular burada görünür.'}</div>}
        {list.map((r) => (
          <div key={r.id} className="row" style={{ alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{r.company} <Pill tone={ST[r.status][1]}>{ST[r.status][0]}</Pill></div>
              <div style={{ color: 'var(--tx2)', fontSize: 13 }}>{r.name} · <a href={`mailto:${r.email}`}>{r.email}</a> · <a href={`tel:${r.phone}`}>{r.phone}</a></div>
              <div style={{ color: 'var(--tx3)', fontSize: 12 }}>Başvuru: {fmt(r.created_at)} · Son giriş: {fmt(r.last_login)}{r.lang ? ` · Dil: ${r.lang.toUpperCase()}` : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {r.status !== 'approved' && <button className="btn" onClick={() => setStatus(r, 'approved')}><Check size={14} /> Onayla</button>}
              {r.status === 'pending' && <button className="btn-ghost" onClick={() => setStatus(r, 'rejected')}><X size={14} /> Reddet</button>}
              {r.status === 'approved' && <button className="btn-ghost" onClick={() => setStatus(r, 'rejected')}>Erişimi kapat</button>}
              <button className="btn-ghost" aria-label="Şifre sıfırla" title="Şifre sıfırla" onClick={() => resetPw(r)}><KeyRound size={14} /></button>
              <button className="btn-ghost" aria-label="Sil" onClick={() => remove(r)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
