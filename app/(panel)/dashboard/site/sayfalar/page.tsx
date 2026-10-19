'use client'
import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { LANGS, LANG_NAMES, Label, PageHead, api, getRows, useToast, type Row } from '@panel/components/site/ui'
import { PAGE_NAMES, PAGE_SLUGS, defaultDoc, type PageSlug } from '@/lib/page-docs'
import type { Lang } from '@/lib/i18n'
import type { PageDoc } from '@/lib/pages'

const lines = (v: string) => v.split('\n').map((x) => x.trim()).filter(Boolean)

export default function Page() {
  const say = useToast()
  const [slug, setSlug] = useState<PageSlug>('sss')
  const [lang, setLang] = useState<Lang>('tr')
  const [all, setAll] = useState<Row>({})
  const [doc, setDoc] = useState<PageDoc | null>(null)
  const [custom, setCustom] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => { getRows('site_settings').then((r) => setAll(r.find((x) => x.key === 'pages')?.value ?? {})).catch((e) => say(e.message)) }, [say])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    const o = all?.[slug]?.[lang]
    setCustom(!!o)
    setDoc(structuredClone(o ?? defaultDoc(slug, lang)))
  }, [all, slug, lang])

  async function put(next: Row, msg: string) {
    setBusy(true)
    try { await api('POST', '/api/site', { action: 'upsert', table: 'site_settings', row: { key: 'pages', value: next } }); setAll(next); say(msg) } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }
  const save = () => doc && put({ ...all, [slug]: { ...(all[slug] ?? {}), [lang]: doc } }, 'Kaydedildi, site güncellendi.')
  function reset() {
    if (!confirm('Bu dil için yaptığınız değişiklikler silinip varsayılan metne dönülsün mü?')) return
    const cur = { ...(all[slug] ?? {}) }; delete cur[lang]
    put({ ...all, [slug]: cur }, 'Varsayılan metne dönüldü.')
  }

  const upd = (patch: Partial<PageDoc>) => setDoc((d) => ({ ...d!, ...patch }))
  const setBlock = (i: number, patch: Row) => setDoc((d) => ({ ...d!, blocks: d!.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)) }))
  const move = (i: number, dir: -1 | 1) => setDoc((d) => { const b = [...d!.blocks]; const j = i + dir; if (j < 0 || j >= b.length) return d; [b[i], b[j]] = [b[j], b[i]]; return { ...d!, blocks: b } })
  const isFaq = slug === 'sss'
  const isCareer = slug === 'kariyer'

  return (
    <>
      <PageHead title="Sayfalar" sub="SSS, gizlilik, çerez, kullanım koşulları ve kariyer sayfalarının metinleri. Her dili ayrı düzenlersiniz." />
      <div className="card" style={{ padding: 14, marginBottom: 16, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PAGE_SLUGS.map((s) => <button key={s} className={slug === s ? 'btn' : 'btn-ghost'} onClick={() => setSlug(s)}>{PAGE_NAMES[s]}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {LANGS.map((l) => <button key={l} className={lang === l ? 'btn' : 'btn-ghost'} onClick={() => setLang(l as Lang)}>{LANG_NAMES[l]}{all?.[slug]?.[l] ? ' ✓' : ''}</button>)}
        </div>
        <div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>✓ işareti o dilde metni değiştirdiğinizi gösterir. İşaretsiz diller varsayılan metni gösterir. Sayfa adresi: <b>/{slug}</b></div>
      </div>
      {doc && (
        <div className="card" style={{ padding: 20 }}>
          <Label>Başlık</Label>
          <input className="inp" value={doc.title} onChange={(e) => upd({ title: e.target.value })} />
          <Label>Giriş metni</Label>
          <textarea className="inp" rows={3} value={doc.lead} onChange={(e) => upd({ lead: e.target.value })} />
          {!isCareer && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '22px 0 6px' }}>
                <b>{isFaq ? 'Sorular' : 'Bölümler'}</b>
                <button className="btn-ghost" onClick={() => setDoc({ ...doc, blocks: [...doc.blocks, { h: '', p: [''] }] })}><Plus size={14} /> {isFaq ? 'Soru ekle' : 'Bölüm ekle'}</button>
              </div>
              {doc.blocks.map((b, i) => (
                <div key={i} className="card" style={{ padding: 14, marginBottom: 10, background: 'var(--s2)' }}>
                  <Label>{isFaq ? 'Soru' : 'Bölüm başlığı'}</Label>
                  <input className="inp" value={b.h ?? ''} onChange={(e) => setBlock(i, { h: e.target.value })} />
                  <Label>{isFaq ? 'Yanıt' : 'Paragraflar (boş satırla ayırın)'}</Label>
                  <textarea className="inp" rows={isFaq ? 3 : 4} value={(b.p ?? []).join(isFaq ? '\n' : '\n\n')} onChange={(e) => setBlock(i, { p: (isFaq ? [e.target.value] : e.target.value.split(/\n\s*\n/)).map((x) => x.trim()).filter((x, k, a) => x || a.length === 1) })} />
                  {!isFaq && (
                    <>
                      <Label>Madde işaretli liste (her satır bir madde, isteğe bağlı)</Label>
                      <textarea className="inp" rows={3} value={(b.ul ?? []).join('\n')} onChange={(e) => setBlock(i, { ul: lines(e.target.value) })} />
                    </>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button className="btn-ghost" aria-label="Yukarı" onClick={() => move(i, -1)}><ArrowUp size={14} /></button>
                    <button className="btn-ghost" aria-label="Aşağı" onClick={() => move(i, 1)}><ArrowDown size={14} /></button>
                    <button className="btn-danger" aria-label="Sil" onClick={() => setDoc({ ...doc, blocks: doc.blocks.filter((_, j) => j !== i) })}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <button className="btn-ghost" disabled={!custom || busy} onClick={reset}><RotateCcw size={14} /> Varsayılana dön</button>
            <button className="btn" disabled={busy} onClick={save}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button>
          </div>
        </div>
      )}
    </>
  )
}
