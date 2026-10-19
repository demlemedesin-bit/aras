'use client'
import { grid, type Row } from '@panel/components/site/ui'
import { BarList } from '@panel/components/site/charts'
import { EVENT, Empty, Funnel, Kpi, Table, fmtNum, fmtPct, useReport } from '@panel/components/site/analytics-ui'

export default function Page() {
  const { r, err } = useReport()
  if (err) return <div className="card" style={{ padding: 20, color: 'var(--red)' }}>{err}</div>
  const ev = (n: string) => r?.events?.find((e: Row) => e.name === n)
  const chs: Row[] = (r?.channels ?? []).filter((c: Row) => c.sessions)
  return (
    <>
      <Empty r={r} />
      <div style={grid(200)}>
        <Kpi label="Katalog talebi" value={r ? fmtNum(ev('catalog_submit')?.total ?? 0) : '–'} sub="gönderilen form" />
        <Kpi label="İletişim formu" value={r ? fmtNum(ev('contact_submit')?.total ?? 0) : '–'} sub="gönderilen form" />
        <Kpi label="Bayi başvurusu" value={r ? fmtNum(ev('dealer_register')?.total ?? 0) : '–'} sub="yeni firma kaydı" />
        <Kpi label="Bayi girişi" value={r ? fmtNum(ev('dealer_login')?.total ?? 0) : '–'} sub="onaylı bayi oturumu" />
        <Kpi label="Dönüşüm oranı" value={r ? fmtPct(r.totals.sessions ? +((r.totals.conversions / r.totals.sessions) * 100).toFixed(1) : 0) : '–'} sub="talep/başvuru yapan oturum" />
      </div>
      <div style={{ ...grid(440), marginTop: 18 }}>
        <div className="card"><div className="card-h"><span className="card-title">Talep hunisi</span><span className="card-meta">oturum bazında</span></div>
          <Funnel steps={r ? [
            { label: 'Siteyi ziyaret eden oturum', value: r.totals.sessions },
            { label: 'Ürünlere / koleksiyona ulaşan', value: Math.max(r.sections.find((s: Row) => s.name === 'koleksiyonlar')?.sessions ?? 0, r.sections.find((s: Row) => s.name === 'urunler')?.sessions ?? 0) },
            { label: 'Katalog formunu açan', value: ev('catalog_open')?.visitors ?? 0 },
            { label: 'Talep / başvuru yapan', value: r.totals.conversions },
          ] : []} />
        </div>
        <div className="card"><div className="card-h"><span className="card-title">Tüm etkileşimler</span></div>
          <BarList items={(r?.events ?? []).map((e: Row) => ({ label: EVENT[e.name] ?? e.name, value: e.total }))} empty="Henüz etkileşim yok" /></div>
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><span className="card-title">Hangi kanal talep getiriyor</span></div>
        <Table cols={[{ h: 'Kanal', k: 'name' }, { h: 'Oturum', k: 'sessions', r: true }, { h: 'Talep', k: 'conversions', r: true }, { h: 'Dönüşüm', k: 'rate', r: true, f: fmtPct }]} rows={chs} />
      </div>
    </>
  )
}
