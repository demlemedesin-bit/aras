'use client'
import { useEffect, useState } from 'react'
import { ImageField, Label, PageHead, api, getRows, useToast, type Row } from '@panel/components/site/ui'

export default function Page() {
  const say = useToast()
  const [hero, setHero] = useState<Row>({ showroom: '', home: '', garden: '' })
  const [c, setC] = useState<Row>({ social: {} })
  const [busy, setBusy] = useState(false)
  useEffect(() => { getRows('site_settings').then((r) => { for (const x of r) { if (x.key === 'hero') setHero(x.value); if (x.key === 'contact') setC({ social: {}, ...x.value }) } }).catch((e) => say(e.message)) }, [say])

  async function save(key: string, value: Row) {
    setBusy(true)
    try { const j = await api('POST', '/api/site', { action: 'upsert', table: 'site_settings', row: { key, value } }); say(j.revalidated === false ? 'Kaydedildi (site 5 dk içinde güncellenir)' : 'Kaydedildi, site güncellendi') } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }
  const phone = (v: string) => `tel:+${v.replace(/\D/g, '')}`
  const txt = (l: string, k: string, extra?: (v: string) => Row) => (
    <div><Label>{l}</Label><input className="inp" value={c[k] ?? ''} onChange={(e) => setC({ ...c, [k]: e.target.value, ...(extra ? extra(e.target.value) : {}) })} /></div>
  )
  const soc = (l: string, k: string) => <div><Label>{l}</Label><input className="inp" value={c.social?.[k] ?? ''} onChange={(e) => setC({ ...c, social: { ...c.social, [k]: e.target.value } })} /></div>

  return (
    <>
      <PageHead title="Ayarlar" sub="Ana görseller ve iletişim bilgileri." />
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h"><span className="card-title">Hero görselleri</span><button className="btn" disabled={busy} onClick={() => save('hero', hero)}>Kaydet</button></div>
        <div style={{ padding: '4px 20px 20px' }}>
          <Label>Showroom paneli (büyük arka plan)</Label><ImageField value={hero.showroom} onChange={(v) => setHero({ ...hero, showroom: v })} />
          <Label>Ev kartı</Label><ImageField value={hero.home} onChange={(v) => setHero({ ...hero, home: v })} />
          <Label>Bahçe kartı</Label><ImageField value={hero.garden} onChange={(v) => setHero({ ...hero, garden: v })} />
        </div>
      </div>
      <div className="card">
        <div className="card-h"><span className="card-title">İletişim ve sosyal medya</span><button className="btn" disabled={busy} onClick={() => save('contact', c)}>Kaydet</button></div>
        <div style={{ padding: '4px 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '0 16px' }}>
          {txt('Telefon', 'tel', (v) => ({ telHref: phone(v) }))}
          {txt('Faks', 'fax', (v) => ({ faxHref: phone(v) }))}
          {txt('E-posta (form ve katalog talebi buraya yönlenir)', 'mail')}
          {txt('Yol tarifi bağlantısı', 'directions')}
          {txt('Harita gömme adresi (Google Maps embed)', 'map')}
          {soc('Instagram', 'instagram')}{soc('Facebook', 'facebook')}{soc('X (Twitter)', 'x')}{soc('LinkedIn', 'linkedin')}
        </div>
      </div>
    </>
  )
}
