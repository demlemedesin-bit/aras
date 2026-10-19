'use client'
import ListManager from '@panel/components/site/ListManager'
import { Pill } from '@panel/components/site/ui'
export default function Page() {
  return <ListManager cfg={{
    table: 'site_news', pk: 'id', title: 'Fuarlar ve ödüller', sub: 'Sitedeki Fuarlar / Ödüller sekmeleri. “Ödül” işaretli kayıtlar Ödüller sekmesinde, diğerleri Fuarlar sekmesinde görünür. Başlık/tarih metin anahtarı olarak girilir; yeni haber için önce Metinler sayfasında anahtarı ekleyin.', singular: 'kayıt',
    defaults: { href: 'https://arasmetal.com/', head_key: '', date_key: '', year: '', badge_key: '', award: false, active: true },
    head: (r, tr) => tr(r.head_key), meta: (r, tr) => <>{r.award && <Pill tone="ok">Ödül</Pill>}<span>{r.year || tr(r.date_key)}</span></>,
    fields: [{ k: 'head_key', l: 'Başlık', t: 'key' }, { k: 'date_key', l: 'Tarih', t: 'key' }, { k: 'year', l: 'Yıl (tarih yerine, opsiyonel)' }, { k: 'badge_key', l: 'Rozet', t: 'key' }, { k: 'href', l: 'Bağlantı' }, { k: 'award', l: 'Ödül (Ödüller sekmesinde göster)', t: 'bool' }, { k: 'active', l: 'Yayında', t: 'bool' }],
  }} />
}
