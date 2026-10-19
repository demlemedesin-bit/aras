'use client'
import { useState } from 'react'
import { BarList } from '@panel/components/site/charts'
import { grid, type Row } from '@panel/components/site/ui'
import { DEVICE, EVENT, Empty, Kpi, Table, country, downloadCsv, fmtDur, fmtNum, pageName, useReport, when } from '@panel/components/site/analytics-ui'

export default function Page() {
  const { r, err } = useReport()
  const [q, setQ] = useState('')
  const [only, setOnly] = useState<'all' | 'conv' | 'ret'>('all')
  const [open, setOpen] = useState<string | null>(null)
  if (err) return <div className="card" style={{ padding: 20, color: 'var(--red)' }}>{err}</div>
  const list: Row[] = (r?.journeys ?? []).filter((j: Row) => {
    if (only === 'conv' && !j.converted) return false
    if (only === 'ret' && !j.returning && j.visits < 2) return false
    const hay = `${j.country} ${j.city ?? ''} ${j.source} ${j.campaign ?? ''} ${j.entry} ${j.pages.map((p: Row) => p.path).join(' ')}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })
  const f = r?.freq
  return (
    <>
      <Empty r={r} />
      <div style={grid(200)}>
        <Kpi label="Yeni ziyaretçi" value={r ? fmtNum(r.audience.new) : '–'} sub="ilk kez gelen (onaylı)" />
        <Kpi label="Tekrar gelen" value={r ? fmtNum(r.audience.returning) : '–'} sub="daha önce de gelmiş" />
        <Kpi label="Tanımsız ziyaretçi" value={r ? fmtNum(r.audience.anonymous) : '–'} sub="çerezi reddeden / eski kayıt" />
      </div>

      <div style={{ ...grid(420), marginTop: 18 }}>
        <div className="card">
          <div className="card-h"><span className="card-title">Kaç kez gelmişler</span><span className="card-meta">dönem içinde, onaylı ziyaretçi</span></div>
          <BarList items={f ? [{ label: '1 kez', value: f.one }, { label: '2 kez', value: f.two }, { label: '3 kez', value: f.three }, { label: '4 ve üzeri', value: f.more }] : []} empty="Henüz veri yok" />
        </div>
        <div className="card">
          <div className="card-h"><span className="card-title">Oturum süresi dağılımı</span></div>
          <BarList items={r ? ['Ölçülemedi', '10 sn altı', '10–60 sn', '1–3 dk', '3 dk üstü'].map((l, i) => ({ label: l, value: r.durations[i] })) : []} empty="Henüz veri yok" />
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h">
          <span className="card-title">Ziyaretçi yolculukları</span>
          <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input className="inp" style={{ width: 200 }} placeholder="Ülke, kaynak, sayfa ara…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="inp" style={{ width: 160 }} value={only} onChange={(e) => setOnly(e.target.value as typeof only)}>
              <option value="all">Tüm oturumlar</option><option value="conv">Talep yapanlar</option><option value="ret">Tekrar gelenler</option>
            </select>
            <button className="btn-ghost" onClick={() => downloadCsv('oturumlar', ['Zaman', 'Ülke', 'Şehir', 'Cihaz', 'Kanal', 'Kaynak', 'Kampanya', 'Giriş', 'Sayfa sayısı', 'Süre (sn)', 'Talep', 'Yol'], list.map((j) => [j.first, country(j.country), j.city ?? '', DEVICE[j.device] ?? j.device, j.channel, j.source, j.campaign ?? '', j.entry, j.views, j.dur, j.converted ? 'Evet' : '', j.pages.map((p: Row) => p.path).join(' > ')]))}>CSV</button>
          </span>
        </div>
        {list.length === 0 && <div style={{ padding: '18px 20px', color: 'var(--tx3)' }}>Eşleşen oturum yok</div>}
        {list.map((j) => {
          const id = j.sid
          const on = open === id
          return (
            <div key={id} style={{ borderBottom: '1px solid var(--bdr)' }}>
              <button onClick={() => setOpen(on ? null : id)} style={{ all: 'unset', display: 'grid', gridTemplateColumns: 'minmax(120px,1.1fr) minmax(120px,1fr) minmax(110px,1fr) 80px 70px', gap: 12, padding: '11px 20px', cursor: 'pointer', width: 'calc(100% - 40px)', alignItems: 'center' }}>
                <span><b>{[j.city, country(j.country)].filter(Boolean).join(', ')}</b><br /><small style={{ color: 'var(--tx3)' }}>{when(j.first)} · {DEVICE[j.device] ?? j.device}{j.browser ? ` · ${j.browser}` : ''}</small></span>
                <span>{j.channel}<br /><small style={{ color: 'var(--tx3)' }}>{j.campaign ? `${j.campaign} · ` : ''}{j.source}</small></span>
                <span style={{ overflowWrap: 'anywhere' }}>{pageName(j.entry)}<br /><small style={{ color: 'var(--tx3)' }}>giriş sayfası</small></span>
                <span>{j.views} sayfa<br /><small style={{ color: 'var(--tx3)' }}>{fmtDur(j.dur)}</small></span>
                <span style={{ textAlign: 'right' }}>{j.converted && <span className="badge badge-ac">Talep</span>}{(j.returning || j.visits > 1) && <span className="badge" style={{ marginLeft: 4 }}>{j.visits}. gelişi</span>}</span>
              </button>
              {on && (
                <div style={{ padding: '4px 20px 16px 20px', background: 'var(--s2)' }}>
                  <div style={{ fontSize: 12, color: 'var(--tx3)', margin: '8px 0' }}>
                    {j.referrer ? `Geldiği site: ${j.referrer}` : 'Doğrudan geldi'}{j.os ? ` · ${j.os}` : ''}{j.lang ? ` · site dili ${j.lang.toUpperCase()}` : ''}{j.uid ? ` · ziyaretçi ${j.uid}` : ''}
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 4 }}>
                    {j.pages.map((p: Row, i: number) => <li key={i}><b>{pageName(p.path)}</b> <small style={{ color: 'var(--tx3)' }}>{new Date(p.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{p.dur ? ` · ${fmtDur(p.dur)} kaldı` : ''}</small></li>)}
                  </ol>
                  {j.events.length > 0 && <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{j.events.map((e: string, i: number) => <span key={i} className="badge badge-ac">{EVENT[e] ?? e}</span>)}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><span className="card-title">Tekrar eden ziyaretçiler</span><span className="card-meta">en çok gelenler (anonim kod)</span></div>
        <Table cols={[
          { h: 'Ziyaretçi', k: 'uid', f: (x, rr) => <span><b>{x}</b><br /><small style={{ color: 'var(--tx3)' }}>{[rr.city, country(rr.country)].filter(Boolean).join(', ')}</small></span> },
          { h: 'Gelişi', k: 'sessions', r: true },
          { h: 'Sayfa', k: 'views', r: true },
          { h: 'Toplam süre', k: 'dur', r: true, f: fmtDur },
          { h: 'İlk', k: 'first', f: when },
          { h: 'Son', k: 'last', f: when },
          { h: 'Baktığı sayfalar', k: 'pages', f: (x: string[]) => x.map(pageName).join(', ') },
          { h: 'Talep', k: 'converted', f: (x) => (x ? '✓' : '') },
        ]} rows={r?.profiles ?? []} empty="Henüz tekrar eden ziyaretçi yok. Ziyaretçiler çerezi kabul ettikçe burada görünür." />
      </div>
    </>
  )
}
