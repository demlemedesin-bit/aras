'use client'
import { useEffect, useState } from 'react'
import { Label, PageHead, api, getRows, useToast, type Row } from '@panel/components/site/ui'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com'

export default function Robots() {
  const say = useToast()
  const [seo, setSeo] = useState<Row>({})
  const [extra, setExtra] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { getRows('site_settings').then((r) => { const v = r.find((x) => x.key === 'seo')?.value ?? {}; setSeo(v); setExtra((v.robots_extra ?? []).join('\n')) }).catch((e) => say(e.message)) }, [say])

  const paths = extra.split('\n').map((x) => x.trim()).filter((x) => x.startsWith('/'))
  async function save() {
    setSaving(true)
    try { await api('POST', '/api/site', { action: 'upsert', table: 'site_settings', row: { key: 'seo', value: { ...seo, robots_extra: paths } } }); say('Kaydedildi. Sitede 5 dk içinde yansır.') } catch (e: any) { say(e.message) } finally { setSaving(false) }
  }
  return (
    <>
      <PageHead title="Robots ve sitemap" sub="Arama motorlarının hangi adreslere girebileceğini ve sitemap’te hangi sayfaların olduğunu görün." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: 18 }}>
        <div className="card">
          <div className="card-h"><span className="card-title">robots.txt</span><a className="card-meta" href={`${SITE}/robots.txt`} target="_blank" rel="noopener">Aç ↗</a></div>
          <div style={{ padding: 20 }}>
            <pre style={{ background: 'var(--s2)', padding: 14, borderRadius: 8, fontSize: 12.5, whiteSpace: 'pre-wrap', margin: 0 }}>{`User-Agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /login\nDisallow: /admin\nDisallow: /api\nDisallow: /bayi\n${paths.map((p) => `Disallow: ${p}`).join('\n')}${paths.length ? '\n' : ''}\nSitemap: ${SITE}/sitemap.xml`}</pre>
            <Label>Ek engellenecek adresler (her satıra bir tane, / ile başlar)</Label>
            <textarea className="inp" rows={4} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="/gecici-sayfa" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}><button className="btn" disabled={saving} onClick={save}>{saving ? '…' : 'Kaydet'}</button></div>
          </div>
        </div>
        <div className="card">
          <div className="card-h"><span className="card-title">sitemap.xml</span><a className="card-meta" href={`${SITE}/sitemap.xml`} target="_blank" rel="noopener">Aç ↗</a></div>
          <div style={{ padding: 20, lineHeight: 1.7, color: 'var(--tx2)' }}>
            Sitemap otomatik üretilir: ana sayfa, SSS, kariyer, gizlilik, çerez politikası ve kullanım koşulları. “Sayfa bazlı SEO” sekmesinde gizlediğiniz sayfalar sitemap’ten çıkar. Bayi kataloğu (/bayi) girişe bağlıdır, bu yüzden hem robots’ta engelli hem sitemap’te yoktur.
            <div style={{ marginTop: 12 }}>Search Console’a sitemap olarak <b>sitemap.xml</b> adresini ekleyin.</div>
          </div>
        </div>
      </div>
    </>
  )
}
