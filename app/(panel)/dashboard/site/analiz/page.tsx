'use client'
import { useMemo } from 'react'
import { AreaChart, BarList, Delta, dayLabel } from '@panel/components/site/charts'
import { grid, type Row } from '@panel/components/site/ui'
import { Empty, Heatmap, Kpi, Table, country, fmtDur, fmtNum, fmtPct, pageName, useReport, DEVICE } from '@panel/components/site/analytics-ui'

export default function Page() {
  const { r, err, days, loading } = useReport()
  const daily: Row[] = r?.daily ?? []
  const vis = useMemo(() => daily.map((d) => d.visitors), [daily])
  if (err) return <div className="card" style={{ padding: 20, color: 'var(--red)' }}>{err}</div>
  const t = r?.totals, p = r?.prev
  const v = (x: any) => (r ? x : '–')
  const wd = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
  return (
    <>
      <Empty r={r} />
      <div style={grid(200)}>
        <Kpi label="Ziyaretçi" value={v(fmtNum(t?.visitors ?? 0))} sub={r && <Delta cur={t.visitors} prev={p.visitors} />} />
        <Kpi label="Oturum" value={v(fmtNum(t?.sessions ?? 0))} sub={r && <Delta cur={t.sessions} prev={p.sessions} />} />
        <Kpi label="Sayfa görüntüleme" value={v(fmtNum(t?.views ?? 0))} sub={r && <Delta cur={t.views} prev={p.views} />} />
        <Kpi label="Oturum başına sayfa" value={v(String(t?.pagesPerSession ?? 0).replace('.', ','))} sub={r && <span style={{ color: 'var(--tx3)' }}>önceki: {String(p.pagesPerSession).replace('.', ',')}</span>} />
        <Kpi label="Ort. oturum süresi" value={v(fmtDur(t?.avgDur ?? 0))} sub={r && <span style={{ color: 'var(--tx3)' }}>önceki: {fmtDur(p.avgDur)}</span>} />
        <Kpi label="Hemen çıkma" value={v(fmtPct(t?.bounce ?? 0))} sub={r && <span style={{ color: 'var(--tx3)' }}>tek sayfa bakıp çıkan</span>} />
        <Kpi label="Gelen talep" value={v(fmtNum(t?.requests ?? 0))} sub={r && <Delta cur={t.requests} prev={p.requests} />} />
        <Kpi label="Dönüşüm oranı" value={v(r && t.sessions ? fmtPct(+((t.conversions / t.sessions) * 100).toFixed(1)) : '%0')} sub={r && <span style={{ color: 'var(--tx3)' }}>{t.conversions} oturum talep/başvuru yaptı</span>} />
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><span className="card-title">Ziyaretçi, oturum ve görüntüleme</span><span className="card-meta">son {days} gün</span></div>
        {r ? <AreaChart labels={daily.map((d) => dayLabel(d.day))} series={[{ name: 'Ziyaretçi', data: vis, color: 'var(--ac)', fill: true }, { name: 'Oturum', data: daily.map((d) => d.sessions), color: 'var(--amber)' }, { name: 'Görüntüleme', data: daily.map((d) => d.views), color: 'var(--blue)' }]} /> : <div style={{ padding: 22, color: 'var(--tx3)' }}>{loading ? 'Yükleniyor…' : ''}</div>}
      </div>

      <div style={{ ...grid(440), marginTop: 18 }}>
        <div className="card">
          <div className="card-h"><span className="card-title">Trafik kanalları</span><span className="card-meta">oturum</span></div>
          <Table cols={[{ h: 'Kanal', k: 'name' }, { h: 'Oturum', k: 'sessions', r: true }, { h: 'Talep', k: 'conversions', r: true }, { h: 'Oran', k: 'rate', r: true, f: (x) => fmtPct(x) }]} rows={(r?.channels ?? []).filter((c: Row) => c.sessions)} />
        </div>
        <div className="card">
          <div className="card-h"><span className="card-title">En çok bakılan sayfalar</span></div>
          <Table cols={[{ h: 'Sayfa', k: 'path', f: pageName }, { h: 'Görüntüleme', k: 'views', r: true }, { h: 'Ort. süre', k: 'avgDur', r: true, f: fmtDur }]} rows={r?.pages ?? []} max={8} />
        </div>
      </div>

      <div style={{ ...grid(440), marginTop: 18 }}>
        <div className="card">
          <div className="card-h"><span className="card-title">Ziyaret yoğunluğu</span><span className="card-meta">gün × saat (TSİ)</span></div>
          {r ? <Heatmap data={r.heat} /> : null}
        </div>
        <div className="card">
          <div className="card-h"><span className="card-title">Haftanın günleri</span></div>
          <BarList items={wd.map((d, i) => ({ label: d, value: r?.weekdays?.[i] ?? 0 }))} empty="Henüz veri yok" />
        </div>
      </div>

      <div style={{ ...grid(300), marginTop: 18 }}>
        <div className="card"><div className="card-h"><span className="card-title">Ülkeler</span></div><BarList items={(r?.countries ?? []).slice(0, 8).map((x: Row) => ({ label: country(x.country), value: x.n }))} empty="Henüz veri yok" /></div>
        <div className="card"><div className="card-h"><span className="card-title">Cihazlar</span></div><BarList items={(r?.devices ?? []).map((x: Row) => ({ label: DEVICE[x.device] ?? x.device, value: x.n }))} empty="Henüz veri yok" /></div>
        <div className="card"><div className="card-h"><span className="card-title">Yeni / tekrar gelen</span></div>
          <BarList items={r ? [{ label: 'Yeni ziyaretçi', value: r.audience.new }, { label: 'Tekrar gelen', value: r.audience.returning }, { label: 'Tanımsız (çerez reddi)', value: r.audience.anonymous }] : []} empty="Henüz veri yok" /></div>
      </div>
    </>
  )
}
