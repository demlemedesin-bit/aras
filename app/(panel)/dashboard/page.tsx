'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Package, Layers, Images, Newspaper, Handshake, Inbox, FileText, Plus } from 'lucide-react'
import TopBar from '@panel/components/TopBar'
import { Pill, ToastProvider, api, grid, type Row } from '@panel/components/site/ui'

const STATS: { k: string; label: string; href: string; Icon: typeof Package }[] = [
  { k: 'products', label: 'Ürün', href: 'urunler', Icon: Package },
  { k: 'collections', label: 'Koleksiyon', href: 'koleksiyonlar', Icon: Layers },
  { k: 'gallery', label: 'Galeri görseli', href: 'galeri', Icon: Images },
  { k: 'news', label: 'Haber', href: 'haberler', Icon: Newspaper },
  { k: 'partners', label: 'İş ortağı', href: 'ortaklar', Icon: Handshake },
  { k: 'texts', label: 'Site metni', href: 'metinler', Icon: FileText },
]

const QUICK: [string, string][] = [
  ['urunler', 'Ürün ekle / düzenle'], ['koleksiyonlar', 'Koleksiyonları düzenle'], ['galeri', 'Galeriye görsel ekle'],
  ['haberler', 'Haber yayınla'], ['metinler', 'Metni düzenle (6 dil)'], ['ayarlar', 'Hero görselleri & iletişim bilgileri'],
]

const dayLabel = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })

function Trend({ data }: { data: { day: string; n: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.n))
  return (
    <div style={{ padding: '18px 20px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
        {data.map((d) => (
          <div key={d.day} title={`${dayLabel(d.day)}: ${d.n}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
            <div style={{ height: `${Math.max(d.n ? 8 : 3, (d.n / max) * 100)}%`, background: d.n ? 'var(--ac)' : 'var(--s3)', borderRadius: 4, opacity: d.n ? 1 : .6 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tx3)', fontSize: 11, marginTop: 8 }}>
        <span>{dayLabel(data[0].day)}</span><span>{dayLabel(data[data.length - 1].day)}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [s, setS] = useState<Row | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => { api('GET', '/api/site?stats=1').then(setS).catch((e) => setErr(e.message)) }, [])
  const total14 = s ? s.trend.reduce((a: number, d: Row) => a + d.n, 0) : 0

  return (
    <ToastProvider>
      <TopBar title="Dashboard" subtitle="arasmetal.com" action={<>
        <Link href="/dashboard/site/urunler" className="btn"><Plus size={14} strokeWidth={2.2} /> Ürün ekle</Link>
      </>} />
      <div style={{ padding: '18px 20px 40px', overflow: 'auto' }}>
        {err && <div className="card" style={{ padding: 16, color: 'var(--red)', marginBottom: 14 }}>{err}. SUPABASE_SERVICE_ROLE_KEY ortam değişkenini kontrol edin.</div>}

        <div style={grid(190)}>
          <Link href="/dashboard/site/mesajlar" className="kpi" style={{ display: 'block', borderColor: s?.unread ? 'var(--ac)' : undefined }}>
            <div className="kpi-label">Yeni talepler</div>
            <div className="kpi-value">{s ? s.unread : '–'}</div>
            <div className="kpi-sub">{s ? `${s.pending} bekleyen · ${s.inbox} toplam` : ' '}</div>
          </Link>
          <div className="kpi">
            <div className="kpi-label">Katalog talebi</div>
            <div className="kpi-value">{s ? s.catalog : '–'}</div>
            <div className="kpi-sub">Siteden gelen katalog istekleri</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">İletişim formu</div>
            <div className="kpi-value">{s ? s.contact : '–'}</div>
            <div className="kpi-sub">Genel mesajlar</div>
          </div>
          <Link href="/dashboard/site/urunler" className="kpi" style={{ display: 'block' }}>
            <div className="kpi-label">Yayındaki ürün</div>
            <div className="kpi-value">{s ? s.products : '–'}</div>
            <div className="kpi-sub">{s ? `${s.collections} koleksiyon` : ' '}</div>
          </Link>
        </div>

        <div style={{ ...grid(420), marginTop: 18 }}>
          <div className="card">
            <div className="card-h"><span className="card-title">Talepler · son 14 gün</span><span className="card-meta">{s ? `${total14} talep` : ''}</span></div>
            {s ? <Trend data={s.trend} /> : <div style={{ padding: 20, color: 'var(--tx3)' }}>Yükleniyor…</div>}
          </div>
          <div className="card">
            <div className="card-h"><span className="card-title">Ülkelere göre talepler</span><span className="card-meta">İlk 5</span></div>
            <div style={{ padding: '8px 0' }}>
              {s?.topCountries?.map((c: Row) => {
                const max = s.topCountries[0].n
                return (
                  <div key={c.country} style={{ padding: '8px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}><span>{c.country}</span><b>{c.n}</b></div>
                    <div style={{ height: 6, background: 'var(--s3)', borderRadius: 99 }}><div style={{ width: `${(c.n / max) * 100}%`, height: '100%', background: 'var(--ac)', borderRadius: 99 }} /></div>
                  </div>
                )
              })}
              {s && !s.topCountries.length && <div style={{ padding: 20, color: 'var(--tx3)' }}>Henüz ülke bilgisi içeren talep yok</div>}
            </div>
          </div>
        </div>

        <div style={{ ...grid(420), marginTop: 18 }}>
          <div className="card">
            <div className="card-h"><span className="card-title">Son talepler</span><Link href="/dashboard/site/mesajlar" className="card-meta">Tümü →</Link></div>
            {(s?.latest ?? []).map((m: Row) => (
              <Link key={m.id} href="/dashboard/site/mesajlar" style={{ display: 'block', padding: '10px 20px', borderBottom: '1px solid var(--bdr)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <b>{m.name}</b>{m.company && <small style={{ color: 'var(--tx3)' }}>{m.company}</small>}
                  {m.topic === 'catalog' && <Pill tone="ok">Katalog</Pill>}
                  {m.status === 'new' && <Pill tone="ac">Yeni</Pill>}
                  <small style={{ marginLeft: 'auto', color: 'var(--tx3)' }}>{new Date(m.created_at).toLocaleDateString('tr-TR')}</small>
                </div>
                <div style={{ color: 'var(--tx3)', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</div>
              </Link>
            ))}
            {s && !s.latest.length && <div style={{ padding: 20, color: 'var(--tx3)' }}>Henüz talep yok</div>}
          </div>
          <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
            <div className="card">
              <div className="card-h"><span className="card-title">Site içeriği</span></div>
              <div style={{ ...grid(130), padding: 14, gap: 10 }}>
                {STATS.map(({ k, label, href, Icon }) => (
                  <Link key={k} href={`/dashboard/site/${href}`} className="card" style={{ padding: 12, display: 'block' }}>
                    <Icon size={14} strokeWidth={1.8} style={{ color: 'var(--tx3)' }} />
                    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{s ? s[k] : '–'}</div>
                    <div style={{ color: 'var(--tx3)', fontSize: 12 }}>{label}</div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-h"><span className="card-title">Hızlı işlemler</span></div>
              <div style={{ padding: 14, display: 'grid', gap: 8 }}>
                {QUICK.map(([slug, label]) => <Link key={slug} href={`/dashboard/site/${slug}`} className="btn-ghost">{label}</Link>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}
