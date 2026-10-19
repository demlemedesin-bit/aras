'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import { Label, PageHead, api, getRows, grid, useToast, type Row } from '@panel/components/site/ui'
import { Kpi, Table, fmtNum, fmtPct } from '@panel/components/site/analytics-ui'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com'
const TAGS: { k: string; label: string; ph: string; help: string }[] = [
  { k: 'ga4', label: 'Google Analytics 4 ölçüm kimliği', ph: 'G-XXXXXXXXXX', help: 'GA4 → Yönetici → Veri akışları → Ölçüm kimliği' },
  { k: 'gtm', label: 'Google Tag Manager kapsayıcı kimliği', ph: 'GTM-XXXXXXX', help: 'GA4 ile birlikte kullanmayın, aynı olayı iki kez sayar. Ya biri ya diğeri.' },
  { k: 'gads', label: 'Google Ads dönüşüm kimliği', ph: 'AW-1234567890', help: 'Google Ads → Hedefler → Dönüşümler → Etiket kurulumu' },
  { k: 'gads_label', label: 'Google Ads dönüşüm etiketi', ph: 'abcDEFghiJKL', help: 'Form gönderilince (katalog/iletişim) Ads’e dönüşüm gönderilir' },
  { k: 'meta', label: 'Meta (Facebook/Instagram) Piksel kimliği', ph: '1234567890123456', help: 'Events Manager → Veri kaynakları → Piksel kimliği' },
  { k: 'clarity', label: 'Microsoft Clarity proje kimliği', ph: 'abcd1234ef', help: 'Ücretsiz ısı haritası ve oturum kaydı için' },
]
const PRESETS: [string, string, string][] = [
  ['Google Ads', 'google', 'cpc'], ['Meta (Facebook/Instagram)', 'facebook', 'paid_social'], ['LinkedIn reklamı', 'linkedin', 'paid_social'],
  ['E-posta / bülten', 'newsletter', 'email'], ['Sosyal medya (organik)', 'instagram', 'social'], ['Fuar / basılı QR', 'fuar', 'offline'], ['Diğer', '', ''],
]
const PAGES = ['/', '/bayi/urunler', '/sss', '/kariyer']
const slug = (s: string) => s.trim().toLowerCase().replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u').replace(/[ş]/g, 's').replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ç]/g, 'c').replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')

export default function Page() {
  const say = useToast()
  const [cfg, setCfg] = useState<Row>({})
  const [saving, setSaving] = useState(false)
  const [days, setDays] = useState(30)
  const [rep, setRep] = useState<Row | null>(null)
  const [spend, setSpend] = useState<Row[]>([])
  const [u, setU] = useState({ page: '/', preset: 0, source: 'google', medium: 'cpc', campaign: '', term: '', content: '' })

  useEffect(() => { getRows('site_settings').then((r) => setCfg(r.find((x) => x.key === 'ads')?.value ?? {})).catch((e) => say(e.message)) }, [say])
  const loadSpend = useCallback(() => getRows('site_ad_spend').then(setSpend).catch(() => setSpend([])), [])
  useEffect(() => { loadSpend() }, [loadSpend])
  useEffect(() => { setRep(null); api('GET', `/api/site?report=1&days=${days}`).then(setRep).catch((e) => say(e.message)) }, [days, say])

  async function saveTags() {
    setSaving(true)
    try { await api('POST', '/api/site', { action: 'upsert', table: 'site_settings', row: { key: 'ads', value: Object.fromEntries(Object.entries(cfg).map(([k, v]) => [k, String(v ?? '').trim()])) } }); say('Etiketler kaydedildi. Sitede 5 dk içinde devreye girer.') } catch (e: any) { say(e.message) } finally { setSaving(false) }
  }

  const link = useMemo(() => {
    const q = new URLSearchParams()
    if (u.source) q.set('utm_source', slug(u.source))
    if (u.medium) q.set('utm_medium', slug(u.medium))
    if (u.campaign) q.set('utm_campaign', slug(u.campaign))
    if (u.term) q.set('utm_term', slug(u.term))
    if (u.content) q.set('utm_content', slug(u.content))
    const qs = q.toString()
    return `${SITE}${u.page}${qs ? '?' + qs : ''}`
  }, [u])

  const camps: Row[] = useMemo(() => {
    const sp = Object.fromEntries(spend.map((s) => [s.campaign, s]))
    return (rep?.campaigns ?? []).map((c: Row) => {
      const [n, s, m] = String(c.name).split('||')
      const cost = sp[n]?.amount ? Number(sp[n].amount) : 0
      return { ...c, camp: n, label: `${n} (${s}${m ? ' / ' + m : ''})`, cost, cur: sp[n]?.currency ?? 'TRY', cpl: cost && c.conversions ? cost / c.conversions : 0, cps: cost && c.sessions ? cost / c.sessions : 0 }
    })
  }, [rep, spend])
  const paid = (rep?.channels ?? []).find((c: Row) => c.name === 'Reklam')
  const totalCost = camps.reduce((a, c) => a + c.cost, 0)
  const totalConv = camps.reduce((a, c) => a + c.conversions, 0)

  async function setCost(campaign: string, amount: string) {
    try { await api('POST', '/api/site', { action: 'upsert', table: 'site_ad_spend', row: { campaign, amount: Number(amount.replace(',', '.')) || 0, updated_at: new Date().toISOString() } }); loadSpend() } catch (e: any) { say(e.message) }
  }

  return (
    <>
      <PageHead title="Reklam ve kampanyalar" sub="Reklam etiketlerini bağlayın, takipli bağlantı üretin, hangi kampanyanın talep getirdiğini görün." />

      <div style={grid(220)}>
        <Kpi label="Reklamdan gelen oturum" value={rep ? fmtNum(paid?.sessions ?? 0) : '–'} sub={`son ${days} gün`} />
        <Kpi label="Reklamdan gelen talep" value={rep ? fmtNum(paid?.conversions ?? 0) : '–'} sub={paid ? fmtPct(paid.rate) + ' dönüşüm' : ''} />
        <Kpi label="Girilen harcama" value={totalCost ? totalCost.toLocaleString('tr-TR') : '–'} sub="kampanya tablosundan" />
        <Kpi label="Talep başına maliyet" value={totalCost && totalConv ? (totalCost / totalConv).toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '–'} sub="harcama girilen kampanyalar" />
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><span className="card-title">Kampanya performansı</span>
          <span style={{ display: 'flex', gap: 6 }}>{[7, 30, 90].map((p) => <button key={p} className={p === days ? 'btn' : 'btn-ghost'} onClick={() => setDays(p)}>{p} gün</button>)}</span></div>
        <Table cols={[
          { h: 'Kampanya', k: 'label' },
          { h: 'Oturum', k: 'sessions', r: true },
          { h: 'Talep', k: 'conversions', r: true },
          { h: 'Dönüşüm', k: 'rate', r: true, f: fmtPct },
          { h: 'Harcama (₺)', k: 'cost', r: true, f: (_, c) => <input key={c.camp + c.cost} className="inp" style={{ width: 100, textAlign: 'right', padding: '5px 8px' }} defaultValue={c.cost || ''} placeholder="0" onBlur={(e) => e.target.value !== String(c.cost || '') && setCost(c.camp, e.target.value)} /> },
          { h: 'Talep başı', k: 'cpl', r: true, f: (x) => (x ? x.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '–') },
          { h: 'Oturum başı', k: 'cps', r: true, f: (x) => (x ? x.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) : '–') },
        ]} rows={camps} empty="Henüz kampanya bağlantısıyla gelen ziyaretçi yok. Aşağıdan bağlantı üretip reklamlarınızda kullanın." />
      </div>

      <div style={{ ...grid(460), marginTop: 18 }}>
        <div className="card">
          <div className="card-h"><span className="card-title">Takipli bağlantı oluşturucu</span></div>
          <div style={{ padding: '4px 20px 18px' }}>
            <Label>Hedef sayfa</Label>
            <select className="inp" value={u.page} onChange={(e) => setU({ ...u, page: e.target.value })}>{PAGES.map((p) => <option key={p} value={p}>{p === '/' ? 'Ana sayfa' : p}</option>)}</select>
            <Label>Mecra</Label>
            <select className="inp" value={u.preset} onChange={(e) => { const i = Number(e.target.value); setU({ ...u, preset: i, source: PRESETS[i][1], medium: PRESETS[i][2] }) }}>{PRESETS.map((p, i) => <option key={p[0]} value={i}>{p[0]}</option>)}</select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><Label>Kaynak (utm_source)</Label><input className="inp" value={u.source} onChange={(e) => setU({ ...u, source: e.target.value })} /></div>
              <div><Label>Ortam (utm_medium)</Label><input className="inp" value={u.medium} onChange={(e) => setU({ ...u, medium: e.target.value })} /></div>
            </div>
            <Label>Kampanya adı (utm_campaign)</Label>
            <input className="inp" value={u.campaign} onChange={(e) => setU({ ...u, campaign: e.target.value })} placeholder="ör. yaz-2026-bahce" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><Label>Anahtar kelime (isteğe bağlı)</Label><input className="inp" value={u.term} onChange={(e) => setU({ ...u, term: e.target.value })} /></div>
              <div><Label>Reklam içeriği (isteğe bağlı)</Label><input className="inp" value={u.content} onChange={(e) => setU({ ...u, content: e.target.value })} placeholder="ör. video-a" /></div>
            </div>
            <Label>Oluşan bağlantı</Label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="inp" readOnly value={link} onFocus={(e) => e.target.select()} />
              <button className="btn" onClick={() => navigator.clipboard.writeText(link).then(() => say('Kopyalandı'))}><Copy size={14} /> Kopyala</button>
            </div>
            <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginTop: 10, lineHeight: 1.6 }}>Google Ads’te otomatik etiketleme açıksa (gclid) ve Meta’da fbclid ile gelenler zaten “Reklam” kanalında sayılır. Bu bağlantı kampanya ve kelime ayrımını görmenizi sağlar.</div>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><span className="card-title">Reklam ve analitik etiketleri</span></div>
          <div style={{ padding: '4px 20px 18px' }}>
            {TAGS.map((t) => (
              <div key={t.k}>
                <Label>{t.label}</Label>
                <input className="inp" value={cfg[t.k] ?? ''} onChange={(e) => setCfg({ ...cfg, [t.k]: e.target.value })} placeholder={t.ph} />
                <div style={{ color: 'var(--tx3)', fontSize: 12, marginTop: 4 }}>{t.help}</div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}><button className="btn" disabled={saving} onClick={saveTags}>{saving ? '…' : 'Etiketleri kaydet'}</button></div>
            <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginTop: 12, lineHeight: 1.6 }}>Etiketler yalnızca çerezleri <b>kabul eden</b> ziyaretçilerde ve yönetici girişi yokken yüklenir. Katalog/iletişim formu gönderimi ve bayi başvurusu dönüşüm olarak Google Analytics, Meta ve Google Ads’e iletilir. Yalnızca geçerli kimlik biçimleri kabul edilir.</div>
          </div>
        </div>
      </div>
    </>
  )
}
