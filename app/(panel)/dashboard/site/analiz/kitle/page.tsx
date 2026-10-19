'use client'
import { grid, type Row } from '@panel/components/site/ui'
import { BarList } from '@panel/components/site/charts'
import { DEVICE, LANGN, Empty, country, fmtPct, useReport } from '@panel/components/site/analytics-ui'

export default function Page() {
  const { r, err } = useReport()
  if (err) return <div className="card" style={{ padding: 20, color: 'var(--red)' }}>{err}</div>
  const tot = (rows: Row[]) => rows.reduce((a, x) => a + x.n, 0) || 1
  const pct = (rows: Row[]) => (v: number) => fmtPct(Math.round((v / tot(rows)) * 100))
  const box = (title: string, rows: Row[], label: (x: Row) => string) => (
    <div className="card"><div className="card-h"><span className="card-title">{title}</span></div>
      <BarList items={rows.map((x) => ({ label: label(x), value: x.n }))} format={pct(rows)} empty="Henüz veri yok" /></div>
  )
  return (
    <>
      <Empty r={r} />
      <div style={grid(360)}>
        {box('Ülkeler', r?.countries ?? [], (x) => country(x.country))}
        {box('Şehirler', r?.cities ?? [], (x) => { const [c, k] = String(x.city).split('|'); return `${c}${k ? ', ' + country(k) : ''}` })}
        {box('Cihazlar', r?.devices ?? [], (x) => DEVICE[x.device] ?? x.device)}
        {box('Tarayıcılar', r?.browsers ?? [], (x) => x.browser)}
        {box('İşletim sistemleri', r?.oses ?? [], (x) => x.os)}
        {box('Site dili', r?.langs ?? [], (x) => LANGN[x.lang] ?? x.lang)}
        {box('Ekran çözünürlüğü', r?.screens ?? [], (x) => x.screen)}
      </div>
      <div className="card" style={{ padding: '14px 18px', marginTop: 18, color: 'var(--tx2)', lineHeight: 1.6 }}>
        Şehir bilgisi yalnızca Vercel'in coğrafi başlığı olduğunda gelir. Ziyaretçiler tekil sayılır; IP adresi saklanmaz.
      </div>
    </>
  )
}
