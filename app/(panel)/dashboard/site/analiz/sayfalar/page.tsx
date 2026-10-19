'use client'
import { grid, type Row } from '@panel/components/site/ui'
import { BarList } from '@panel/components/site/charts'
import { Empty, Table, downloadCsv, fmtDur, fmtPct, pageName, useReport, SECTION } from '@panel/components/site/analytics-ui'

export default function Page() {
  const { r, err } = useReport()
  if (err) return <div className="card" style={{ padding: 20, color: 'var(--red)' }}>{err}</div>
  const sess = r?.totals.sessions || 1
  return (
    <>
      <Empty r={r} />
      <div className="card">
        <div className="card-h"><span className="card-title">Tüm sayfalar</span>
          <button className="btn-ghost" onClick={() => r && downloadCsv('sayfalar', ['Sayfa', 'Görüntüleme', 'Ziyaretçi', 'Ort. süre (sn)', 'Giriş', 'Çıkış', 'Çıkış %', 'Hemen çıkma %'], r.pages.map((p: Row) => [p.path, p.views, p.visitors, p.avgDur, p.entries, p.exits, p.exitRate, p.bounce]))}>CSV</button></div>
        <Table cols={[
          { h: 'Sayfa', k: 'path', f: pageName },
          { h: 'Görüntüleme', k: 'views', r: true },
          { h: 'Ziyaretçi', k: 'visitors', r: true },
          { h: 'Ort. süre', k: 'avgDur', r: true, f: fmtDur },
          { h: 'Giriş', k: 'entries', r: true },
          { h: 'Çıkış', k: 'exits', r: true },
          { h: 'Çıkış %', k: 'exitRate', r: true, f: fmtPct },
          { h: 'Hemen çıkma', k: 'bounce', r: true, f: fmtPct },
        ]} rows={r?.pages ?? []} />
      </div>
      <div style={{ ...grid(420), marginTop: 18 }}>
        <div className="card"><div className="card-h"><span className="card-title">Giriş sayfaları</span><span className="card-meta">ziyaretçi siteye buradan giriyor</span></div>
          <Table cols={[{ h: 'Sayfa', k: 'path', f: pageName }, { h: 'Giriş', k: 'n', r: true }, { h: 'Hemen çıkma', k: 'bounce', r: true, f: fmtPct }]} rows={r?.entries ?? []} /></div>
        <div className="card"><div className="card-h"><span className="card-title">Çıkış sayfaları</span><span className="card-meta">ziyaretçi siteden burada ayrılıyor</span></div>
          <Table cols={[{ h: 'Sayfa', k: 'path', f: pageName }, { h: 'Çıkış', k: 'n', r: true }, { h: 'Oran', k: 'rate', r: true, f: fmtPct }]} rows={r?.exits ?? []} /></div>
      </div>
      <div style={{ ...grid(420), marginTop: 18 }}>
        <div className="card"><div className="card-h"><span className="card-title">Ana sayfada hangi bölümlere ulaşılıyor</span><span className="card-meta">oturum oranı</span></div>
          <BarList items={Object.entries(SECTION).map(([id, label]) => ({ label, value: r?.sections?.find((x: Row) => x.name === id)?.sessions ?? 0 }))} format={(v) => fmtPct(Math.min(100, Math.round((v / sess) * 100)))} empty="Henüz veri yok" /></div>
        <div className="card"><div className="card-h"><span className="card-title">Sayfalar arası geçişler</span><span className="card-meta">en sık yol</span></div>
          <BarList items={(r?.flow ?? []).map((x: Row) => ({ label: x.path, value: x.n }))} empty="Henüz birden fazla sayfa gezen ziyaretçi yok" /></div>
      </div>
    </>
  )
}
