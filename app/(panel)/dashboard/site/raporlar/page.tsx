'use client'
import { useEffect, useMemo, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { PageHead, api, useToast, type Row } from '@panel/components/site/ui'
import { AreaChart, dayLabel } from '@panel/components/site/charts'
import { Table, country, downloadCsv, fmtDur, fmtNum, fmtPct, pageName, DEVICE, EVENT } from '@panel/components/site/analytics-ui'

const pc = (cur: number, prev: number) => (!prev ? (cur ? 'yeni' : '–') : `${cur >= prev ? '+' : '−'}%${Math.abs(Math.round(((cur - prev) / prev) * 100))}`)

export default function Page() {
  const say = useToast()
  const [days, setDays] = useState(30)
  const [r, setR] = useState<Row | null>(null)
  const [seo, setSeo] = useState<Row | null>(null)
  const [spend, setSpend] = useState<Row[]>([])
  useEffect(() => { setR(null); api('GET', `/api/site?report=1&days=${days}`).then(setR).catch((e) => say(e.message)) }, [days, say])
  useEffect(() => { api('GET', '/api/site?seo=1').then(setSeo).catch(() => {}); api('GET', '/api/site?table=site_ad_spend').then((j) => setSpend(j.rows)).catch(() => {}) }, [])

  const insights = useMemo(() => {
    if (!r) return []
    const t = r.totals, p = r.prev, out: string[] = []
    out.push(`Son ${days} günde ${fmtNum(t.visitors)} ziyaretçi ${fmtNum(t.sessions)} oturumda ${fmtNum(t.views)} sayfa görüntüledi (önceki dönem: ${pc(t.visitors, p.visitors)} ziyaretçi).`)
    if (t.requests || p.requests) out.push(`${fmtNum(t.requests)} talep/mesaj alındı (önceki dönem ${fmtNum(p.requests)}, ${pc(t.requests, p.requests)}).`)
    const ch = r.channels.filter((c: Row) => c.sessions).sort((a: Row, b: Row) => b.sessions - a.sessions)[0]
    if (ch) out.push(`En büyük trafik kanalı ${ch.name}: ${fmtNum(ch.sessions)} oturum, ${ch.conversions} talep (${fmtPct(ch.rate)} dönüşüm).`)
    const best = r.channels.filter((c: Row) => c.conversions).sort((a: Row, b: Row) => b.rate - a.rate)[0]
    if (best && best.name !== ch?.name) out.push(`En yüksek dönüşüm ${best.name} kanalında: ${fmtPct(best.rate)}.`)
    const pg = r.pages[0]; if (pg) out.push(`En çok bakılan sayfa ${pageName(pg.path)} (${fmtNum(pg.views)} görüntüleme, ortalama ${fmtDur(pg.avgDur)}).`)
    const c = r.countries[0]; if (c) out.push(`Ziyaretçilerin en çoğu ${country(c.country)} kaynaklı (${c.n} ziyaretçi).`)
    if (t.bounce >= 70) out.push(`Hemen çıkma oranı yüksek (${fmtPct(t.bounce)}). Açılış sayfası ve ilk ekran içeriğini gözden geçirin.`)
    if (r.audience.returning) out.push(`${r.audience.returning} ziyaretçi siteye tekrar geldi.`)
    const camp = r.campaigns[0]; if (camp) out.push(`Öne çıkan kampanya: ${String(camp.name).split('||')[0]} (${camp.sessions} oturum, ${camp.conversions} talep).`)
    return out
  }, [r, days])

  const csvAll = () => {
    if (!r) return
    downloadCsv('rapor-ozet', ['Bölüm', 'Ad', 'Oturum/Görüntüleme', 'Ziyaretçi', 'Talep', 'Oran %'], [
      ...r.channels.filter((c: Row) => c.sessions).map((c: Row) => ['Kanal', c.name, c.sessions, c.visitors, c.conversions, c.rate]),
      ...r.sources.map((c: Row) => ['Kaynak', c.name, c.sessions, c.visitors, c.conversions, c.rate]),
      ...r.campaigns.map((c: Row) => ['Kampanya', String(c.name).split('||')[0], c.sessions, c.visitors, c.conversions, c.rate]),
      ...r.pages.map((p: Row) => ['Sayfa', p.path, p.views, p.visitors, '', p.bounce]),
      ...r.countries.map((c: Row) => ['Ülke', country(c.country), '', c.n, '', '']),
      ...r.daily.map((d: Row) => ['Gün', d.day, d.views, d.visitors, d.conv, '']),
    ])
  }

  const t = r?.totals, p = r?.prev
  const totalSpend = spend.reduce((a, s) => a + Number(s.amount || 0), 0)
  return (
    <>
      <style>{`@media print{.dsb,.mm-mobile,.topbar,.noprint{display:none!important}.dw{display:block!important;height:auto!important;overflow:visible!important}.dm{overflow:visible!important;height:auto!important}body,html{background:#fff!important;height:auto!important}.card{break-inside:avoid;box-shadow:none!important}}`}</style>
      <PageHead title="Raporlar" sub="Dönem seçin, otomatik özeti okuyun; yazdırın, PDF olarak kaydedin ya da CSV indirin."
        action={<div className="noprint" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[7, 30, 90].map((d) => <button key={d} className={d === days ? 'btn' : 'btn-ghost'} onClick={() => setDays(d)}>{d} gün</button>)}
          <button className="btn-ghost" onClick={csvAll} disabled={!r}><Download size={14} /> CSV</button>
          <button className="btn" onClick={() => window.print()} disabled={!r}><Printer size={14} /> Yazdır / PDF</button>
        </div>} />

      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div><b style={{ fontSize: 17 }}>Aras Metal — Web sitesi performans raporu</b>
            <div style={{ color: 'var(--tx3)', marginTop: 2 }}>Son {days} gün · {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
          {seo && <div style={{ textAlign: 'right' }}><div style={{ color: 'var(--tx3)', fontSize: 12 }}>SEO skoru</div><b style={{ fontSize: 20 }}>{seo.score}/100</b></div>}
        </div>
        <ul style={{ margin: '16px 0 0', paddingLeft: 20, lineHeight: 1.75 }}>
          {!r && <li style={{ color: 'var(--tx3)' }}>Rapor hazırlanıyor…</li>}
          {insights.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginTop: 16 }}>
        {[['Ziyaretçi', t?.visitors, p?.visitors], ['Oturum', t?.sessions, p?.sessions], ['Sayfa görüntüleme', t?.views, p?.views], ['Talep', t?.requests, p?.requests]].map(([l, a, b]) => (
          <div className="kpi" key={String(l)}><span className="kpi-label">{l as string}</span><div className="kpi-value">{r ? fmtNum(a as number) : '–'}</div><div className="kpi-sub">{r ? `önceki dönem ${fmtNum(b as number)} · ${pc(a as number, b as number)}` : ''}</div></div>
        ))}
        <div className="kpi"><span className="kpi-label">Ort. süre</span><div className="kpi-value">{r ? fmtDur(t.avgDur) : '–'}</div><div className="kpi-sub">{r ? `${String(t.pagesPerSession).replace('.', ',')} sayfa/oturum` : ''}</div></div>
        <div className="kpi"><span className="kpi-label">Dönüşüm</span><div className="kpi-value">{r ? fmtPct(t.sessions ? +((t.conversions / t.sessions) * 100).toFixed(1) : 0) : '–'}</div><div className="kpi-sub">{totalSpend && r && t.conversions ? `talep başı ${(totalSpend / t.conversions).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺ (girilen harcama)` : ''}</div></div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h"><span className="card-title">Günlük seyir</span></div>
        {r && <AreaChart labels={r.daily.map((d: Row) => dayLabel(d.day))} series={[{ name: 'Ziyaretçi', data: r.daily.map((d: Row) => d.visitors), color: 'var(--ac)', fill: true }, { name: 'Görüntüleme', data: r.daily.map((d: Row) => d.views), color: 'var(--blue)' }]} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(440px,100%),1fr))', gap: 16, marginTop: 16 }}>
        <div className="card"><div className="card-h"><span className="card-title">Kanallar</span></div>
          <Table cols={[{ h: 'Kanal', k: 'name' }, { h: 'Oturum', k: 'sessions', r: true }, { h: 'Talep', k: 'conversions', r: true }, { h: 'Dönüşüm', k: 'rate', r: true, f: fmtPct }]} rows={(r?.channels ?? []).filter((c: Row) => c.sessions)} /></div>
        <div className="card"><div className="card-h"><span className="card-title">Kampanyalar</span></div>
          <Table cols={[{ h: 'Kampanya', k: 'name', f: (x: string) => x.split('||')[0] }, { h: 'Oturum', k: 'sessions', r: true }, { h: 'Talep', k: 'conversions', r: true }, { h: 'Dönüşüm', k: 'rate', r: true, f: fmtPct }]} rows={r?.campaigns ?? []} empty="Kampanya verisi yok" /></div>
        <div className="card"><div className="card-h"><span className="card-title">En çok bakılan sayfalar</span></div>
          <Table cols={[{ h: 'Sayfa', k: 'path', f: pageName }, { h: 'Görüntüleme', k: 'views', r: true }, { h: 'Ort. süre', k: 'avgDur', r: true, f: fmtDur }, { h: 'Hemen çıkma', k: 'bounce', r: true, f: fmtPct }]} rows={r?.pages ?? []} max={10} /></div>
        <div className="card"><div className="card-h"><span className="card-title">Ülkeler ve cihazlar</span></div>
          <Table cols={[{ h: 'Ülke', k: 'country', f: country }, { h: 'Ziyaretçi', k: 'n', r: true }]} rows={r?.countries ?? []} max={8} />
          <Table cols={[{ h: 'Cihaz', k: 'device', f: (x) => DEVICE[x] ?? x }, { h: 'Ziyaretçi', k: 'n', r: true }]} rows={r?.devices ?? []} /></div>
        <div className="card"><div className="card-h"><span className="card-title">Etkileşimler</span></div>
          <Table cols={[{ h: 'Etkileşim', k: 'name', f: (x) => EVENT[x] ?? x }, { h: 'Toplam', k: 'total', r: true }, { h: 'Ziyaretçi', k: 'visitors', r: true }]} rows={r?.events ?? []} /></div>
        {seo && <div className="card"><div className="card-h"><span className="card-title">SEO özeti</span><span className="card-meta">{seo.score}/100</span></div>
          <Table cols={[{ h: 'Kontrol', k: 'label' }, { h: 'Durum', k: 'status', f: (x) => (x === 'ok' ? '✓' : x === 'warn' ? '⚠' : '✗') }, { h: 'Ayrıntı', k: 'detail' }]} rows={seo.checks.filter((c: Row) => c.status !== 'ok')} empty="Tüm SEO kontrolleri başarılı" /></div>}
      </div>
    </>
  )
}
