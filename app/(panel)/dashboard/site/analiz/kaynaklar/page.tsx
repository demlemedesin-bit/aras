'use client'
import { grid, type Row } from '@panel/components/site/ui'
import { BarList } from '@panel/components/site/charts'
import { Empty, Table, downloadCsv, fmtDur, fmtPct, useReport } from '@panel/components/site/analytics-ui'

const COLS = (label: string) => [
  { h: label, k: 'name' },
  { h: 'Oturum', k: 'sessions', r: true },
  { h: 'Ziyaretçi', k: 'visitors', r: true },
  { h: 'Sayfa/oturum', k: 'pagesPerSession', r: true },
  { h: 'Ort. süre', k: 'avgDur', r: true, f: fmtDur },
  { h: 'Talep', k: 'conversions', r: true },
  { h: 'Dönüşüm', k: 'rate', r: true, f: fmtPct },
]

export default function Page() {
  const { r, err } = useReport()
  if (err) return <div className="card" style={{ padding: 20, color: 'var(--red)' }}>{err}</div>
  const camps: Row[] = (r?.campaigns ?? []).map((c: Row) => { const [n, s, m] = String(c.name).split('||'); return { ...c, name: `${n}${s ? ` (${s}${m ? ' / ' + m : ''})` : ''}` } })
  const chs: Row[] = (r?.channels ?? []).filter((c: Row) => c.sessions)
  return (
    <>
      <Empty r={r} />
      <div style={grid(440)}>
        <div className="card">
          <div className="card-h"><span className="card-title">Kanallar</span><span className="card-meta">ziyaretçi nereden geliyor</span></div>
          <BarList items={chs.map((c) => ({ label: c.name, value: c.sessions }))} empty="Henüz veri yok" />
        </div>
        <div className="card">
          <div className="card-h"><span className="card-title">Kanal performansı</span></div>
          <Table cols={COLS('Kanal')} rows={chs} />
        </div>
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><span className="card-title">Kaynak / ortam</span><span className="card-meta">site adresi ya da utm_source</span>
          <button className="btn-ghost" onClick={() => r && downloadCsv('kaynaklar', ['Kaynak', 'Oturum', 'Ziyaretçi', 'Talep', 'Dönüşüm %'], r.sources.map((s: Row) => [s.name, s.sessions, s.visitors, s.conversions, s.rate]))}>CSV</button></div>
        <Table cols={COLS('Kaynak')} rows={r?.sources ?? []} />
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><span className="card-title">Kampanyalar</span><span className="card-meta">utm_campaign ile gelenler — adres oluşturucu Reklam sayfasında</span>
          <button className="btn-ghost" onClick={() => downloadCsv('kampanyalar', ['Kampanya', 'Oturum', 'Ziyaretçi', 'Talep', 'Dönüşüm %'], camps.map((s) => [s.name, s.sessions, s.visitors, s.conversions, s.rate]))}>CSV</button></div>
        <Table cols={COLS('Kampanya')} rows={camps} empty="Henüz kampanya adresiyle gelen ziyaretçi yok. Reklam sayfasından adres oluşturup reklamlarda kullanın." />
      </div>
      <div style={{ ...grid(440), marginTop: 18 }}>
        <div className="card"><div className="card-h"><span className="card-title">Anahtar kelimeler</span><span className="card-meta">utm_term</span></div>
          <Table cols={COLS('Kelime')} rows={r?.terms ?? []} empty="Henüz veri yok" /></div>
        <div className="card"><div className="card-h"><span className="card-title">Reklam içerikleri</span><span className="card-meta">utm_content</span></div>
          <Table cols={COLS('İçerik')} rows={r?.contents ?? []} empty="Henüz veri yok" /></div>
      </div>
    </>
  )
}
