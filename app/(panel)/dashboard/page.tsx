'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, Inbox, Users, Eye, Percent, Package, Layers, Images, Newspaper, Handshake, Type, Plus, History as HistoryIcon } from 'lucide-react'
import TopBar from '@panel/components/TopBar'
import { useMe } from '@panel/components/Sidebar'
import { Pill, ToastProvider, api, grid, type Row } from '@panel/components/site/ui'
import { AreaChart, Delta, Spark, dayLabel } from '@panel/components/site/charts'

function Stat({ label, value, sub, Icon, tone, spark, href, delta }: { label: string; value: ReactNodeLike; sub: string; delta?: React.ReactNode; Icon: typeof Inbox; tone: 'ac' | 'amber' | 'blue' | 'green'; spark?: number[]; href?: string }) {
  const c = { ac: ['var(--ac)', 'var(--ac2)'], amber: ['var(--amber)', 'var(--amber2)'], blue: ['var(--blue)', 'var(--blue2)'], green: ['var(--green)', 'var(--green2)'] }[tone]
  const body = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="kpi-label" style={{ marginBottom: 0 }}>{label}</span>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: c[1], color: c[0], display: 'grid', placeItems: 'center' }}><Icon size={16} strokeWidth={1.9} /></span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
        <div><div className="kpi-value">{value}</div><div className="kpi-sub" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}><span>{sub}</span>{delta}</div></div>
        {spark && <Spark data={spark} />}
      </div>
    </>
  )
  return href ? <Link href={href} className="kpi" style={{ display: 'block' }}>{body}</Link> : <div className="kpi">{body}</div>
}
type ReactNodeLike = string | number

const CONTENT: { k: string; label: string; href: string; Icon: typeof Package }[] = [
  { k: 'products', label: 'Ürünler', href: 'urunler', Icon: Package },
  { k: 'collections', label: 'Koleksiyonlar', href: 'koleksiyonlar', Icon: Layers },
  { k: 'history', label: 'Tarihçe kayıtları', href: 'tarihce', Icon: HistoryIcon },
  { k: 'news', label: 'Haberler', href: 'haberler', Icon: Newspaper },
  { k: 'partners', label: 'İş ortakları', href: 'ortaklar', Icon: Handshake },
  { k: 'texts', label: 'Site metinleri', href: 'metinler', Icon: Type },
]

export default function Dashboard() {
  const { name } = useMe()
  const [s, setS] = useState<Row | null>(null)
  const [an, setAn] = useState<Row | null>(null)
  const [seo, setSeo] = useState<Row | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    api('GET', '/api/site?stats=1').then(setS).catch((e) => setErr(e.message))
    api('GET', '/api/site?analytics=1&days=14').then(setAn).catch(() => {})
    api('GET', '/api/site?seo=1').then(setSeo).catch(() => {})
  }, [])

  const spark = useMemo(() => (s ? s.trend.map((d: Row) => d.n) : [0, 0]), [s])
  const visSpark = useMemo(() => (an ? an.daily.map((d: Row) => d.visitors) : [0, 0]), [an])
  const viewSpark = useMemo(() => (an ? an.daily.map((d: Row) => d.views) : [0, 0]), [an])
  const conv = an && an.totals.visitors ? ((an.requests / an.totals.visitors) * 100).toFixed(1).replace('.', ',') : '0'
  const alerts = useMemo(() => {
    if (!s) return []
    const a = s.alerts
    const list: { text: string; href: string }[] = []
    if (s.dealersPending) list.push({ text: `${s.dealersPending} firma başvurusu onay bekliyor`, href: '/dashboard/site/bayiler' })
    if (a.stale) list.push({ text: `${a.stale} talep 2 günden uzun süredir yanıt bekliyor`, href: '/dashboard/site/mesajlar' })
    if (a.missingTr) list.push({ text: `${a.missingTr} metinde en az bir dilde çeviri eksik`, href: '/dashboard/site/metinler' })
    if (a.noImg) list.push({ text: `${a.noImg} ürün/koleksiyonda görsel yok`, href: '/dashboard/site/urunler' })
    if (a.passive) list.push({ text: `${a.passive} ürün yayında değil`, href: '/dashboard/site/urunler' })
    if (seo && seo.score < 80) list.push({ text: `SEO skoru ${seo.score}/100, ${seo.checks.filter((c: Row) => c.status !== 'ok').length} madde iyileştirilebilir`, href: '/dashboard/site/seo' })
    return list
  }, [s, seo])
  const first = (name || '').split(' ')[0]
  const funnel: [string, number][] = s ? [['Yeni', s.unread], ['Okundu', s.read], ['Yanıtlandı', s.done]] : []
  const funnelMax = Math.max(1, s?.inbox ?? 1)

  return (
    <ToastProvider>
      <TopBar title="Dashboard" subtitle="arasmetal.com" action={<Link href="/dashboard/site/urunler" className="btn"><Plus size={14} strokeWidth={2.2} /> Ürün ekle</Link>} />
      <div style={{ padding: '22px 24px 48px', overflow: 'auto' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.4px' }}>{first ? `Merhaba ${first}` : 'Merhaba'}</h1>
          <p style={{ color: 'var(--tx3)', marginTop: 2 }}>{s ? (s.unread ? `${s.unread} yeni talep yanıtını bekliyor.` : 'Bekleyen yeni talep yok.') : ' '}</p>
        </div>

        {err && <div className="card" style={{ padding: 16, color: 'var(--red)', marginBottom: 16 }}>{err}. SUPABASE_SERVICE_ROLE_KEY ortam değişkenini kontrol edin.</div>}

        <div style={grid(230)}>
          <Stat label="Ziyaretçi" value={an ? an.totals.visitors : '–'} sub="son 14 gün" Icon={Users} tone="ac" spark={visSpark} href="/dashboard/site/analiz" delta={an && <Delta cur={an.totals.visitors} prev={an.prev.visitors} />} />
          <Stat label="Sayfa görüntüleme" value={an ? an.totals.views : '–'} sub="son 14 gün" Icon={Eye} tone="blue" spark={viewSpark} href="/dashboard/site/analiz" delta={an && <Delta cur={an.totals.views} prev={an.prev.views} />} />
          <Stat label="Gelen talep" value={s ? s.trend.reduce((a: number, d: Row) => a + d.n, 0) : '–'} sub={s ? `${s.unread} yeni, ${s.pending} bekleyen` : ' '} Icon={Inbox} tone="amber" spark={spark} href="/dashboard/site/mesajlar" />
          <Stat label="Talep dönüşümü" value={an ? `%${conv}` : '–'} sub="ziyaretçiden talebe" Icon={Percent} tone="green" href="/dashboard/site/analiz" />
        </div>

        <div style={{ ...grid(440), marginTop: 18 }}>
          <div className="card">
            <div className="card-h"><span className="card-title">Ziyaretçi ve talepler</span><Link href="/dashboard/site/analiz" className="card-meta">Ayrıntılı analiz</Link></div>
            {an && s ? (
              <>
                <AreaChart labels={an.daily.map((d: Row) => dayLabel(d.day))} series={[{ name: 'Ziyaretçi', data: visSpark, color: 'var(--ac)', fill: true }, { name: 'Talep', data: spark, color: 'var(--amber)' }]} />
                {an.totals.views === 0 && <div style={{ padding: '0 20px 16px', color: 'var(--tx3)', fontSize: 12.5 }}>Ziyaret ölçümü yeni açıldı, site ziyaret aldıkça grafik dolacak.</div>}
              </>
            ) : <div style={{ padding: 20, color: 'var(--tx3)' }}>Yükleniyor…</div>}
          </div>
          <div className="card">
            <div className="card-h"><span className="card-title">Dikkat gerekenler</span></div>
            <div style={{ padding: '6px 20px 10px' }}>
              {alerts.map((a) => (
                <Link key={a.text} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: '1px solid var(--bdr)' }}>
                  <AlertTriangle size={15} strokeWidth={1.9} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{a.text}</span>
                  <ChevronRight size={15} style={{ color: 'var(--tx3)' }} />
                </Link>
              ))}
              {s && !alerts.length && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', color: 'var(--tx2)' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--green)' }} /> Şu an dikkat gerektiren bir şey yok.
                </div>
              )}
              {!s && <div style={{ padding: '14px 0', color: 'var(--tx3)' }}>Yükleniyor…</div>}
            </div>
          </div>
        </div>

        <div style={{ ...grid(440), marginTop: 18 }}>
          <div className="card">
            <div className="card-h"><span className="card-title">Talep durumu</span><span className="card-meta">{s ? `${s.inbox} toplam` : ''}</span></div>
            <div style={{ padding: '14px 20px 18px', display: 'grid', gap: 16 }}>
              {funnel.map(([label, n]) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 7 }}><span>{label}</span><span>{n}</span></div>
                  <div style={{ height: 7, background: 'var(--s3)', borderRadius: 99 }}><div style={{ width: `${(n / funnelMax) * 100}%`, height: '100%', background: label === 'Yeni' ? 'var(--ac)' : 'var(--tx3)', borderRadius: 99, opacity: label === 'Yeni' ? 1 : .55 }} /></div>
                </div>
              ))}
              {s && s.topCountries.length > 0 && (
                <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: 14 }}>
                  <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginBottom: 8 }}>Talep gelen ülkeler</div>
                  {s.topCountries.map((c: Row) => <div key={c.country} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>{c.country}</span><b>{c.n}</b></div>)}
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-h"><span className="card-title">Son talepler</span><Link href="/dashboard/site/mesajlar" className="card-meta">Tümü</Link></div>
            {(s?.latest ?? []).map((m: Row) => (
              <Link key={m.id} href="/dashboard/site/mesajlar" className="row" style={{ display: 'block' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <b>{m.name}</b>{m.company && <small style={{ color: 'var(--tx3)' }}>{m.company}</small>}
                  {m.topic === 'catalog' && <Pill tone="ok">Katalog</Pill>}
                  {m.status === 'new' && <Pill tone="ac">Yeni</Pill>}
                  <small style={{ marginLeft: 'auto', color: 'var(--tx3)' }}>{new Date(m.created_at).toLocaleDateString('tr-TR')}</small>
                </div>
                <div style={{ color: 'var(--tx3)', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</div>
              </Link>
            ))}
            {s && !s.latest.length && <div style={{ padding: 22, color: 'var(--tx3)' }}>Henüz talep yok. Siteden gelen mesajlar ve katalog istekleri burada görünür.</div>}
          </div>
        </div>

        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-h"><span className="card-title">Site içeriği</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
            {CONTENT.map(({ k, label, href, Icon }) => (
              <Link key={k} href={`/dashboard/site/${href}`} className="row" style={{ borderBottom: '1px solid var(--bdr)' }}>
                <Icon size={16} strokeWidth={1.8} style={{ color: 'var(--tx3)' }} />
                <span style={{ flex: 1 }}>{label}</span>
                <b>{s ? s[k] : '–'}</b>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}
