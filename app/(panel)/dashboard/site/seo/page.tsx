'use client'
import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'
import { ImageField, LANGS, LANG_NAMES, Label, PageHead, api, getRows, useToast, type Row } from '@panel/components/site/ui'

const ICON = { ok: [CheckCircle2, 'var(--green)'], warn: [AlertTriangle, 'var(--amber)'], bad: [XCircle, 'var(--red)'] } as const
const lenTone = (n: number, lo: number, hi: number) => (!n ? 'var(--red)' : n < lo || n > hi ? 'var(--amber)' : 'var(--green)')

export default function Page() {
  const say = useToast()
  const [audit, setAudit] = useState<Row | null>(null)
  const [busy, setBusy] = useState(false)
  const [meta, setMeta] = useState<Record<string, Row>>({ title: {}, desc: {} })
  const [lang, setLang] = useState<string>('tr')
  const [saving, setSaving] = useState(false)
  const [gsc, setGsc] = useState('')
  const [og, setOg] = useState('')
  const [noindex, setNoindex] = useState(false)

  const runAudit = useCallback(() => { setBusy(true); setAudit(null); api('GET', '/api/site?seo=1').then(setAudit).catch((e) => say(e.message)).finally(() => setBusy(false)) }, [say])
  useEffect(() => { runAudit() }, [runAudit])
  useEffect(() => { getRows('site_settings').then((r) => { const v = r.find((x) => x.key === 'seo')?.value ?? {}; setGsc(v.google_verification ?? ''); setOg(v.og_image ?? ''); setNoindex(v.noindex === true) }).catch(() => {}) }, [])
  useEffect(() => {
    getRows('site_texts').then((r) => { const m: Record<string, Row> = { title: {}, desc: {} }; for (const x of r) if (x.ns === 'meta' && (x.key === 'title' || x.key === 'desc')) m[x.key] = x.value ?? {}; setMeta(m) }).catch((e) => say(e.message))
  }, [say])

  const title: string = meta.title[lang] ?? ''
  const desc: string = meta.desc[lang] ?? ''
  const set = (k: 'title' | 'desc', v: string) => setMeta({ ...meta, [k]: { ...meta[k], [lang]: v } })

  async function save() {
    setSaving(true)
    try {
      for (const k of ['title', 'desc']) await api('POST', '/api/site', { action: 'upsert', table: 'site_texts', row: { ns: 'meta', key: k, value: meta[k] } })
      await api('POST', '/api/site', { action: 'upsert', table: 'site_settings', row: { key: 'seo', value: { google_verification: gsc.trim(), og_image: og.trim(), noindex } } })
      say('Kaydedildi. Arama sonuçlarına yansıması birkaç gün sürebilir.')
    } catch (e: any) { say(e.message) } finally { setSaving(false) }
  }
  const fails = audit ? audit.checks.filter((c: Row) => c.status !== 'ok').length : 0
  const host = (audit?.url ?? 'arasmetal.com').replace(/^https?:\/\//, '')

  return (
    <>
      <PageHead title="SEO" sub="Sitenin arama motorlarına hazır olup olmadığını kontrol edin ve arama sonucunda görünen metni düzenleyin."
        action={<button className="btn-ghost" onClick={runAudit} disabled={busy}><RefreshCw size={14} /> {busy ? 'Kontrol ediliyor…' : 'Yeniden kontrol et'}</button>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: 18 }}>
        <div className="card">
          <div className="card-h"><span className="card-title">Teknik SEO kontrolü</span><span className="card-meta">{audit ? host : ''}</span></div>
          {!audit && <div style={{ padding: 22, color: 'var(--tx3)' }}>Site taranıyor…</div>}
          {audit && (
            <>
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--bdr)' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700, color: audit.score >= 80 ? 'var(--green)' : audit.score >= 55 ? 'var(--amber)' : 'var(--red)', background: `conic-gradient(${audit.score >= 80 ? 'var(--ac)' : audit.score >= 55 ? 'var(--amber)' : 'var(--red)'} ${audit.score * 3.6}deg, var(--s3) 0)`, position: 'relative' }}>
                  <span style={{ position: 'absolute', inset: 6, background: 'var(--s1)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>{audit.score}</span>
                </div>
                <div><b style={{ fontSize: 15 }}>SEO skoru {audit.score}/100</b><div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>{fails ? `${fails} madde iyileştirilebilir` : 'Tüm kontroller başarılı'}</div></div>
              </div>
              {audit.checks.map((c: Row) => {
                const [Icon, color] = ICON[c.status as keyof typeof ICON]
                return (
                  <div key={c.id} className="row" style={{ alignItems: 'flex-start' }}>
                    <Icon size={17} strokeWidth={1.9} style={{ color, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600 }}>{c.label}</div><div style={{ color: 'var(--tx3)', fontSize: 12.5, overflowWrap: 'anywhere' }}>{c.detail}</div></div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="card">
            <div className="card-h"><span className="card-title">Arama sonucu metni</span>
              <select className="inp" style={{ width: 150 }} value={lang} onChange={(e) => setLang(e.target.value)}>{LANGS.map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}</select>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ border: '1px solid var(--bdr)', borderRadius: 10, padding: '12px 14px', background: 'var(--s2)', marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{host}</div>
                <div style={{ fontSize: 17, color: 'var(--blue)', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title || 'Başlık yok'}</div>
                <div style={{ fontSize: 13, color: 'var(--tx2)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc || 'Açıklama yok'}</div>
              </div>
              <Label>Başlık <span style={{ color: lenTone(title.length, 30, 60) }}>({title.length}/60)</span></Label>
              <input className="inp" value={title} onChange={(e) => set('title', e.target.value)} />
              <Label>Açıklama <span style={{ color: lenTone(desc.length, 110, 160) }}>({desc.length}/160)</span></Label>
              <textarea className="inp" rows={4} value={desc} onChange={(e) => set('desc', e.target.value)} />
              </div>
          </div>
          <div className="card">
            <div className="card-h"><span className="card-title">Paylaşım görseli</span></div>
            <div style={{ padding: '4px 20px 18px' }}>
              <Label>WhatsApp, LinkedIn ve sosyal medyada link paylaşılınca görünen görsel (önerilen 1200×630)</Label>
              <ImageField value={og} onChange={setOg} />
              <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginTop: 8 }}>Boş bırakırsanız ana sayfa görseli kullanılır. Değişiklik için en alttaki Kaydet düğmesini kullanın.</div>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><span className="card-title">Arama motoru görünürlüğü</span></div>
            <div style={{ padding: '14px 20px 18px' }}>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', fontWeight: 600 }}><input type="checkbox" checked={noindex} onChange={(e) => setNoindex(e.target.checked)} /> Siteyi arama motorlarından gizle</label>
              <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginTop: 8, lineHeight: 1.6 }}>Yalnızca site yayına hazır değilken açın. Açıkken Google siteyi listelemez. Normalde kapalı kalmalı.</div>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><span className="card-title">Google Search Console</span></div>
            <div style={{ padding: '4px 20px 18px' }}>
              <Label>Doğrulama kodu (HTML etiketi yöntemi, yalnızca content değeri)</Label>
              <input className="inp" value={gsc} onChange={(e) => setGsc(e.target.value)} placeholder="ör. aBc123…" />
              <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginTop: 8, lineHeight: 1.6 }}>Search Console'da siteyi ekleyin, "HTML etiketi" yöntemini seçin ve verilen content değerini buraya yapıştırıp Kaydet'e basın. Sonra Search Console'da Doğrula'ya basın. Sitemap adresi: <b>/sitemap.xml</b></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn" disabled={saving} onClick={save}>{saving ? '…' : 'Tüm SEO ayarlarını kaydet'}</button></div>
          <div className="card" style={{ padding: '14px 20px', lineHeight: 1.6, color: 'var(--tx2)' }}>
            <b style={{ color: 'var(--tx)' }}>Bilmeniz gereken:</b> Site dili sayfa içinde değiştiği için tüm diller tek adreste duruyor. Google yalnızca varsayılan Türkçe sürümü görür. Diğer dillerin aramada ayrı çıkması için dil başına ayrı adres (ör. /en) gerekir.
          </div>
        </div>
      </div>
    </>
  )
}
