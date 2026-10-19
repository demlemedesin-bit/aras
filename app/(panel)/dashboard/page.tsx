'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, Inbox, CalendarDays, Clock, BookOpen, Package, Layers, Images, Newspaper, Handshake, Type, Plus } from 'lucide-react'
import TopBar from '@panel/components/TopBar'
import { useMe } from '@panel/components/Sidebar'
import { Pill, ToastProvider, api, grid, type Row } from '@panel/components/site/ui'

const dayLabel = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })

/* Yumuşak eğri (Catmull-Rom → Bezier) */
function curve(pts: [number, number][]) {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`
  }
  return d
}

function AreaChart({ data }: { data: { day: string; n: number }[] }) {
  const W = 600, H = 170, P = 8
  const max = Math.max(3, ...data.map((d) => d.n))
  const pts: [number, number][] = data.map((d, i) => [P + (i * (W - 2 * P)) / (data.length - 1), H - P - (d.n / max) * (H - 2 * P)])
  const line = curve(pts)
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`
  return (
    <div style={{ padding: '14px 20px 16px' }}>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 170, display: 'block' }} role="img" aria-label="Son 14 günde gelen talepler">
          <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--ac)" stopOpacity=".28" /><stop offset="1" stopColor="var(--ac)" stopOpacity="0" /></linearGradient></defs>
          {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="var(--bdr)" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />)}
          <path d={area} fill="url(#ag)" />
          <path d={line} fill="none" stroke="var(--ac)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span style={{ position: 'absolute', top: 0, left: 0, fontSize: 11, color: 'var(--tx3)' }}>{max}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tx3)', fontSize: 11.5, marginTop: 8 }}>
        {data.filter((_, i) => i % 3 === 0 || i === data.length - 1).map((d) => <span key={d.day}>{dayLabel(d.day)}</span>)}
      </div>
    </div>
  )
}

function Spark({ data }: { data: number[] }) {
  const W = 84, H = 30, max = Math.max(1, ...data)
  const pts: [number, number][] = data.map((n, i) => [(i * W) / (data.length - 1), H - 3 - (n / max) * (H - 8)])
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <path d={curve(pts)} fill="none" stroke="var(--ac)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill="var(--ac)" />
    </svg>
  )
}

function Stat({ label, value, sub, Icon, tone, spark, href }: { label: string; value: ReactNodeLike; sub: string; Icon: typeof Inbox; tone: 'ac' | 'amber' | 'blue' | 'green'; spark?: number[]; href?: string }) {
  const c = { ac: ['var(--ac)', 'var(--ac2)'], amber: ['var(--amber)', 'var(--amber2)'], blue: ['var(--blue)', 'var(--blue2)'], green: ['var(--green)', 'var(--green2)'] }[tone]
  const body = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="kpi-label" style={{ marginBottom: 0 }}>{label}</span>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: c[1], color: c[0], display: 'grid', placeItems: 'center' }}><Icon size={16} strokeWidth={1.9} /></span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
        <div><div className="kpi-value">{value}</div><div className="kpi-sub">{sub}</div></div>
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
  { k: 'gallery', label: 'Galeri görselleri', href: 'galeri', Icon: Images },
  { k: 'news', label: 'Haberler', href: 'haberler', Icon: Newspaper },
  { k: 'partners', label: 'İş ortakları', href: 'ortaklar', Icon: Handshake },
  { k: 'texts', label: 'Site metinleri', href: 'metinler', Icon: Type },
]

export default function Dashboard() {
  const { name } = useMe()
  const [s, setS] = useState<Row | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => { api('GET', '/api/site?stats=1').then(setS).catch((e) => setErr(e.message)) }, [])

  const spark = useMemo(() => (s ? s.trend.map((d: Row) => d.n) : [0, 0]), [s])
  const total14 = s ? spark.reduce((a: number, b: number) => a + b, 0) : 0
  const alerts = useMemo(() => {
    if (!s) return []
    const a = s.alerts
    const list: { text: string; href: string }[] = []
    if (a.stale) list.push({ text: `${a.stale} talep 2 günden uzun süredir yanıt bekliyor`, href: '/dashboard/site/mesajlar' })
    if (a.missingTr) list.push({ text: `${a.missingTr} metinde en az bir dilde çeviri eksik`, href: '/dashboard/site/metinler' })
    if (a.noImg) list.push({ text: `${a.noImg} ürün/koleksiyonda görsel yok`, href: '/dashboard/site/urunler' })
    if (a.passive) list.push({ text: `${a.passive} ürün yayında değil`, href: '/dashboard/site/urunler' })
    return list
  }, [s])
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
          <Stat label="Bugün" value={s ? s.today : '–'} sub="gelen talep" Icon={CalendarDays} tone="ac" spark={spark} href="/dashboard/site/mesajlar" />
          <Stat label="Son 7 gün" value={s ? s.week : '–'} sub="gelen talep" Icon={Inbox} tone="blue" spark={spark} />
          <Stat label="Yanıt bekleyen" value={s ? s.pending : '–'} sub={s ? `${s.unread} yeni, ${s.read} okundu` : ' '} Icon={Clock} tone="amber" href="/dashboard/site/mesajlar" />
          <Stat label="Katalog talebi" value={s ? s.catalog : '–'} sub={s ? `${s.contact} iletişim mesajı` : ' '} Icon={BookOpen} tone="green" />
        </div>

        <div style={{ ...grid(440), marginTop: 18 }}>
          <div className="card">
            <div className="card-h"><span className="card-title">Son 14 gün talepler</span><span className="card-meta">{s ? `${total14} talep` : ''}</span></div>
            {s ? <AreaChart data={s.trend} /> : <div style={{ padding: 20, color: 'var(--tx3)' }}>Yükleniyor…</div>}
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
