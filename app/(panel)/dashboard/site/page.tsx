'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PageHead, Pill, api, grid, type Row } from '@panel/components/site/ui'

const CARDS: [string, string, string][] = [
  ['texts', 'Metin', 'metinler'], ['collections', 'Koleksiyon', 'koleksiyonlar'], ['products', 'Ürün', 'urunler'],
  ['gallery', 'Galeri görseli', 'galeri'], ['news', 'Haber', 'haberler'], ['partners', 'İş ortağı', 'ortaklar'],
]

export default function Overview() {
  const [s, setS] = useState<Row | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => { api('GET', '/api/site?stats=1').then(setS).catch((e) => setErr(e.message)) }, [])
  return (
    <>
      <PageHead title="Genel bakış" sub="Sitedeki her şey buradan yönetilir. Kayıt anında yayına alınır." />
      {err && <div className="card" style={{ padding: 16, color: 'var(--red)', marginBottom: 14 }}>{err}. SUPABASE_SERVICE_ROLE_KEY ortam değişkenini kontrol edin.</div>}
      <div style={grid(170)}>
        {CARDS.map(([k, label, slug]) => (
          <Link key={k} href={`/dashboard/site/${slug}`} className="card" style={{ padding: 16, display: 'block' }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{s ? s[k] : '–'}</div>
            <div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>{label}</div>
          </Link>
        ))}
        <Link href="/dashboard/site/mesajlar" className="card" style={{ padding: 16, display: 'block', borderColor: s?.unread ? 'var(--ac)' : undefined }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{s ? s.unread : '–'}<span style={{ fontSize: 14, color: 'var(--tx3)' }}> / {s ? s.inbox : '–'}</span></div>
          <div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>Yeni / tüm mesajlar</div>
        </Link>
      </div>

      <div style={{ ...grid(360), marginTop: 18 }}>
        <div className="card">
          <div className="card-h"><span className="card-title">Son mesajlar</span><Link href="/dashboard/site/mesajlar" className="card-meta">Tümü →</Link></div>
          {(s?.latest ?? []).map((m: Row) => (
            <div key={m.id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--bdr)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><b>{m.name}</b>{m.status === 'new' && <Pill tone="ac">Yeni</Pill>}<small style={{ marginLeft: 'auto', color: 'var(--tx3)' }}>{new Date(m.created_at).toLocaleDateString('tr-TR')}</small></div>
              <div style={{ color: 'var(--tx3)', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</div>
            </div>
          ))}
          {s && !s.latest.length && <div style={{ padding: 20, color: 'var(--tx3)' }}>Henüz mesaj yok</div>}
        </div>
        <div className="card">
          <div className="card-h"><span className="card-title">Hızlı işlemler</span></div>
          <div style={{ padding: 16, display: 'grid', gap: 8 }}>
            {[['metinler', 'Bir metni düzenle (6 dil)'], ['galeri', 'Galeriye görsel ekle'], ['urunler', 'Öne çıkan ürünü değiştir'], ['ayarlar', 'Hero görsellerini / iletişim bilgilerini güncelle'], ['haberler', 'Yeni haber ekle']].map(([s2, l]) => (
              <Link key={s2} href={`/dashboard/site/${s2}`} className="btn-ghost">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
