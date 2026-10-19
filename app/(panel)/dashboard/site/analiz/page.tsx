'use client'
import { useEffect, useMemo, useState } from 'react'
import { Users, Eye, Inbox, Percent } from 'lucide-react'
import { PageHead, api, grid, useToast, type Row } from '@panel/components/site/ui'
import { AreaChart, BarList, Delta, Spark, dayLabel } from '@panel/components/site/charts'

const DEVICE: Record<string, string> = { mobile: 'Telefon', desktop: 'Bilgisayar', tablet: 'Tablet' }
const LANG: Record<string, string> = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', fr: 'Fransızca', es: 'İspanyolca', it: 'İtalyanca' }
const country = (c: string) => { try { return c.length === 2 ? new Intl.DisplayNames(['tr'], { type: 'region' }).of(c) ?? c : c } catch { return c } }
const PERIODS = [7, 14, 30, 90]

function Kpi({ label, value, Icon, delta, spark }: { label: string; value: string | number; Icon: typeof Users; delta?: React.ReactNode; spark?: number[] }) {
  return (
    <div className="kpi">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="kpi-label" style={{ marginBottom: 0 }}>{label}</span>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--ac2)', color: 'var(--ac)', display: 'grid', placeItems: 'center' }}><Icon size={16} strokeWidth={1.9} /></span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
        <div><div className="kpi-value">{value}</div><div className="kpi-sub">{delta}</div></div>
        {spark && <Spark data={spark} />}
      </div>
    </div>
  )
}

export default function Page() {
  const say = useToast()
  const [days, setDays] = useState(14)
  const [a, setA] = useState<Row | null>(null)
  useEffect(() => { setA(null); api('GET', `/api/site?analytics=1&days=${days}`).then(setA).catch((e) => say(e.message)) }, [days, say])

  const daily = a?.daily ?? []
  const vis = useMemo(() => daily.map((d: Row) => d.visitors), [daily])
  const conv = a && a.totals.visitors ? ((a.requests / a.totals.visitors) * 100).toFixed(1).replace('.', ',') : '0'
  const total = (rows: Row[], k: string) => rows.reduce((s, r) => s + r[k], 0) || 1
  const pct = (rows: Row[]) => { const t = total(rows, 'visitors'); return (v: number) => `%${Math.round((v / t) * 100)}` }

  return (
    <>
      <PageHead title="Ziyaretçi analizi" sub="Siteyi kaç kişi, nereden ve hangi cihazla ziyaret ediyor. Çerez kullanmaz, kişisel veri saklamaz."
        action={<div style={{ display: 'flex', gap: 6 }}>{PERIODS.map((p) => <button key={p} className={p === days ? 'btn' : 'btn-ghost'} onClick={() => setDays(p)}>{p} gün</button>)}</div>} />

      {a && a.totals.views === 0 && (
        <div className="card" style={{ padding: '14px 18px', marginBottom: 16, borderColor: 'var(--amber)', background: 'var(--amber2)' }}>
          Henüz ziyaret verisi yok. Ölçüm yeni açıldı, site ziyaret aldıkça bu sayfa dolar. Yönetim paneline giriş yapmış tarayıcılar sayılmaz.
        </div>
      )}

      <div style={grid(230)}>
        <Kpi label="Ziyaretçi" value={a ? a.totals.visitors : '–'} Icon={Users} spark={vis} delta={a && <Delta cur={a.totals.visitors} prev={a.prev.visitors} />} />
        <Kpi label="Sayfa görüntüleme" value={a ? a.totals.views : '–'} Icon={Eye} spark={daily.map((d: Row) => d.views)} delta={a && <Delta cur={a.totals.views} prev={a.prev.views} />} />
        <Kpi label="Gelen talep" value={a ? a.requests : '–'} Icon={Inbox} delta={a && <Delta cur={a.requests} prev={a.prevRequests} />} />
        <Kpi label="Talep dönüşümü" value={a ? `%${conv}` : '–'} Icon={Percent} delta={<span>ziyaretçiden talebe</span>} />
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><span className="card-title">Ziyaretçi ve görüntüleme</span><span className="card-meta">son {days} gün</span></div>
        {a ? <AreaChart labels={daily.map((d: Row) => dayLabel(d.day))} series={[{ name: 'Ziyaretçi', data: vis, color: 'var(--ac)', fill: true }, { name: 'Görüntüleme', data: daily.map((d: Row) => d.views), color: 'var(--blue)' }]} /> : <div style={{ padding: 22, color: 'var(--tx3)' }}>Yükleniyor…</div>}
      </div>

      <div style={{ ...grid(360), marginTop: 18 }}>
        <div className="card"><div className="card-h"><span className="card-title">Trafik kaynakları</span></div>
          <BarList items={(a?.referrers ?? []).map((r: Row) => ({ label: r.ref, value: r.visitors }))} format={pct(a?.referrers ?? [])} empty="Henüz veri yok" /></div>
        <div className="card"><div className="card-h"><span className="card-title">Ülkeler</span></div>
          <BarList items={(a?.countries ?? []).map((r: Row) => ({ label: country(r.country), value: r.visitors }))} format={pct(a?.countries ?? [])} empty="Henüz veri yok" /></div>
        <div className="card"><div className="card-h"><span className="card-title">Cihazlar</span></div>
          <BarList items={(a?.devices ?? []).map((r: Row) => ({ label: DEVICE[r.device] ?? r.device, value: r.visitors }))} format={pct(a?.devices ?? [])} empty="Henüz veri yok" /></div>
        <div className="card"><div className="card-h"><span className="card-title">Site dili</span></div>
          <BarList items={(a?.langs ?? []).map((r: Row) => ({ label: LANG[r.lang] ?? r.lang, value: r.visitors }))} format={pct(a?.langs ?? [])} empty="Henüz veri yok" /></div>
      </div>
    </>
  )
}
