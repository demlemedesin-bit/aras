'use client'
import { useEffect, useState } from 'react'
import { api, grid, type Row } from '@panel/components/site/ui'
import { AreaChart, BarList } from '@panel/components/site/charts'
import { DEVICE, EVENT, Kpi, Table, ago, country, pageName } from '@panel/components/site/analytics-ui'

export default function Page() {
  const [d, setD] = useState<Row | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    let off = false
    const load = () => api('GET', '/api/site?realtime=1').then((j) => { if (!off) { setD(j); setErr('') } }).catch((e) => !off && setErr(e.message))
    load()
    const id = setInterval(load, 10000)
    return () => { off = true; clearInterval(id) }
  }, [])
  if (err) return <div className="card" style={{ padding: 20, color: 'var(--red)' }}>{err}</div>
  return (
    <>
      <div style={grid(220)}>
        <Kpi label="Şu an sitede (son 5 dk)" value={d ? d.active : '–'} sub={<span style={{ color: 'var(--green)' }}>● canlı, 10 sn'de yenilenir</span>} />
        <Kpi label="Son 30 dakikada" value={d ? d.last30 : '–'} sub="ziyaretçi" />
        <Kpi label="Son 1 saatte" value={d ? d.views60 : '–'} sub="sayfa görüntüleme" />
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><span className="card-title">Dakika dakika görüntüleme</span><span className="card-meta">son 30 dk</span></div>
        {d && <AreaChart labels={d.minutes.map((_: number, i: number) => `${30 - i} dk`)} series={[{ name: 'Görüntüleme', data: d.minutes, color: 'var(--ac)', fill: true }]} height={150} />}
      </div>
      <div style={{ ...grid(420), marginTop: 18 }}>
        <div className="card">
          <div className="card-h"><span className="card-title">Şu an bakılan sayfalar</span></div>
          <BarList items={(d?.pages ?? []).map((x: Row) => ({ label: pageName(x.path), value: x.n }))} empty="Şu an sitede kimse yok" />
        </div>
        <div className="card">
          <div className="card-h"><span className="card-title">Aktif ziyaretçiler</span></div>
          <Table cols={[
            { h: 'Konum', k: 'country', f: (x, r) => [r.city, country(x)].filter(Boolean).join(', ') },
            { h: 'Cihaz', k: 'device', f: (x) => DEVICE[x] ?? x },
            { h: 'Kaynak', k: 'source' },
            { h: 'Sayfa', k: 'path', f: pageName },
            { h: 'Son', k: 'last', r: true, f: (x) => ago(x) },
          ]} rows={d?.now ?? []} empty="Şu an sitede kimse yok" />
        </div>
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><span className="card-title">Canlı akış</span><span className="card-meta">son hareketler</span></div>
        <Table cols={[
          { h: 'Zaman', k: 'ts', f: (x) => ago(x), w: 110 },
          { h: 'Hareket', k: 'kind', f: (x, r) => (x === 'event' ? <b>{EVENT[r.name] ?? r.name}</b> : 'Sayfa görüntüledi') },
          { h: 'Sayfa', k: 'path', f: pageName },
          { h: 'Konum', k: 'country', f: (x, r) => [r.city, country(x)].filter(Boolean).join(', ') },
          { h: 'Cihaz', k: 'device', f: (x) => DEVICE[x] ?? x },
          { h: 'Geldiği yer', k: 'ref', f: (x) => x || 'Doğrudan' },
        ]} rows={d?.feed ?? []} />
      </div>
    </>
  )
}
