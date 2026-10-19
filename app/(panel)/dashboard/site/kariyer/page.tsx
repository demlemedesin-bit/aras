'use client'
import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { LANGS, LANG_NAMES, Label, PageHead } from '@panel/components/site/ui'
import { useSetting } from '@panel/components/site/useSetting'
import { DEFAULT_CAREERS, type CareerCfg, type Position } from '@/lib/site-config'
import { CAREERS } from '@/lib/pages'

const mv = <T,>(a: T[], i: number, d: -1 | 1) => { const b = [...a]; const j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b }
const LABELS: { k: 'name' | 'email' | 'phone' | 'msg' | 'send' | 'position' | 'open'; n: string; d: string }[] = [
  { k: 'name', n: 'Ad soyad alanı', d: 'name' }, { k: 'email', n: 'E-posta alanı', d: 'email' }, { k: 'phone', n: 'Telefon alanı', d: 'phone' },
  { k: 'msg', n: 'Mesaj alanı', d: 'msg' }, { k: 'send', n: 'Gönder düğmesi', d: 'send' }, { k: 'position', n: 'Pozisyon seçimi', d: '' }, { k: 'open', n: 'Açık pozisyonlar başlığı', d: '' },
]
const DEF_L: Record<string, string> = { position: 'Pozisyon', open: 'Açık pozisyonlar' }

export default function Page() {
  const { val: cfg, setVal, saved, busy, save } = useSetting<CareerCfg>('careers', DEFAULT_CAREERS, (r) => ({ ...DEFAULT_CAREERS, ...r, phone: { ...DEFAULT_CAREERS.phone, ...r.phone }, message: { ...DEFAULT_CAREERS.message, ...r.message }, labels: r.labels ?? {}, positions: r.positions ?? [], extra: r.extra ?? [] }))
  const [lang, setLang] = useState<string>('tr')
  const up = (p: Partial<CareerCfg>) => setVal({ ...cfg, ...p })
  const setPos = (i: number, p: Partial<Position>) => up({ positions: cfg.positions.map((x, j) => (j === i ? { ...x, ...p } : x)) })
  const nm = (o: any) => o?.[lang] ?? ''
  const base: Record<string, string> = (CAREERS as any)[lang] ?? CAREERS.en
  const add = () => up({ positions: [...cfg.positions, { id: `p-${Date.now().toString(36)}`, title: {}, place: {}, type: {}, desc: {}, active: true }] })

  return (
    <>
      <PageHead title="Kariyer" sub="Açık pozisyonlar ve başvuru formu. Sayfanın başlığı ve giriş metni Sayfalar bölümündedir. Başvurular Talepler & Mesajlar'a düşer."
        action={<button className="btn" disabled={busy} onClick={() => save()}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button>} />
      <div className="card" style={{ padding: 14, marginBottom: 16, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {LANGS.map((l) => <button key={l} className={lang === l ? 'btn' : 'btn-ghost'} onClick={() => setLang(l)}>{LANG_NAMES[l]}</button>)}
        <span style={{ color: 'var(--tx3)', fontSize: 12.5, marginLeft: 8 }}>{saved ? 'Kayıtlı ayarlar gösteriliyor.' : 'Henüz kaydedilmedi.'} Boş bırakılan dil Türkçeye, o da boşsa varsayılana düşer.</span>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b>Açık pozisyonlar</b>
          <button className="btn-ghost" onClick={add}><Plus size={14} /> Pozisyon ekle</button>
        </div>
        {!cfg.positions.length && <div style={{ color: 'var(--tx3)', marginTop: 10 }}>Pozisyon yok. Eklemezseniz sayfada yalnızca genel başvuru formu görünür.</div>}
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {cfg.positions.map((p, i) => (
            <div key={p.id} className="card" style={{ padding: 14, background: 'var(--s2)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input className="inp" style={{ flex: '1 1 220px', fontWeight: 600 }} placeholder={`Pozisyon adı (${LANG_NAMES[lang]})`} value={nm(p.title)} onChange={(e) => setPos(i, { title: { ...p.title, [lang]: e.target.value } })} />
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={p.active} onChange={(e) => setPos(i, { active: e.target.checked })} /> Yayında</label>
                <button className="btn-ghost" aria-label="Yukarı" onClick={() => up({ positions: mv(cfg.positions, i, -1) })}><ArrowUp size={14} /></button>
                <button className="btn-ghost" aria-label="Aşağı" onClick={() => up({ positions: mv(cfg.positions, i, 1) })}><ArrowDown size={14} /></button>
                <button className="btn-danger" aria-label="Sil" onClick={() => confirm('Pozisyon silinsin mi?') && up({ positions: cfg.positions.filter((_, j) => j !== i) })}><Trash2 size={14} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 8, marginTop: 8 }}>
                <input className="inp" placeholder="Yer (ör. İstanbul)" value={nm(p.place)} onChange={(e) => setPos(i, { place: { ...p.place, [lang]: e.target.value } })} />
                <input className="inp" placeholder="Tür (ör. Tam zamanlı)" value={nm(p.type)} onChange={(e) => setPos(i, { type: { ...p.type, [lang]: e.target.value } })} />
              </div>
              <textarea className="inp" rows={3} style={{ marginTop: 8 }} placeholder="Kısa açıklama / aranan nitelikler" value={nm(p.desc)} onChange={(e) => setPos(i, { desc: { ...p.desc, [lang]: e.target.value } })} />
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <b>Form alanları</b>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 10, fontSize: 14 }}>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={cfg.phone.show} onChange={(e) => up({ phone: { ...cfg.phone, show: e.target.checked } })} /> Telefon alanı görünsün</label>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={cfg.phone.required} disabled={!cfg.phone.show} onChange={(e) => up({ phone: { ...cfg.phone, required: e.target.checked } })} /> Telefon zorunlu</label>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={cfg.message.required} onChange={(e) => up({ message: { required: e.target.checked } })} /> Mesaj zorunlu</label>
        </div>
        <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginTop: 6 }}>Ad soyad ve e-posta her zaman zorunludur.</div>
        <Label>Alan etiketleri ({LANG_NAMES[lang]})</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 8 }}>
          {LABELS.map((f) => (
            <div key={f.k}>
              <div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 3 }}>{f.n}</div>
              <input className="inp" placeholder={f.d ? base[f.d] : DEF_L[f.k]} value={nm(cfg.labels[f.k])} onChange={(e) => up({ labels: { ...cfg.labels, [f.k]: { ...cfg.labels[f.k], [lang]: e.target.value } } })} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
          <b>Ek alanlar</b>
          <button className="btn-ghost" onClick={() => up({ extra: [...cfg.extra, { id: `x${Date.now().toString(36)}`, label: {}, required: false }] })}><Plus size={14} /> Alan ekle</button>
        </div>
        <div style={{ color: 'var(--tx3)', fontSize: 12.5, margin: '4px 0 8px' }}>Ör. LinkedIn bağlantısı, tecrübe yılı. Yanıtlar başvuru mesajının başına eklenir.</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {cfg.extra.map((x, i) => (
            <div key={x.id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input className="inp" style={{ flex: '1 1 220px' }} placeholder={`Alan adı (${LANG_NAMES[lang]})`} value={nm(x.label)} onChange={(e) => up({ extra: cfg.extra.map((y, j) => (j === i ? { ...y, label: { ...y.label, [lang]: e.target.value } } : y)) })} />
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={x.required} onChange={(e) => up({ extra: cfg.extra.map((y, j) => (j === i ? { ...y, required: e.target.checked } : y)) })} /> Zorunlu</label>
              <button className="btn-danger" aria-label="Sil" onClick={() => up({ extra: cfg.extra.filter((_, j) => j !== i) })}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ color: 'var(--tx3)', fontSize: 12.5 }}>Önizleme için Tasarım sayfasındaki canlı önizlemeden Kariyer sayfasını seçebilirsiniz.</div>
    </>
  )
}
