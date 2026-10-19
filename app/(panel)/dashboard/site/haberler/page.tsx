'use client'
import ListManager from '@panel/components/site/ListManager'
import { Pill } from '@panel/components/site/ui'
export default function Page() {
  return <ListManager cfg={{
    table: 'site_news', pk: 'id', title: 'Haberler', sub: 'Fuar ve ödül haberleri. Başlık/tarih metin anahtarı olarak girilir; yeni haber için önce Metinler sayfasında anahtarı ekleyin.', singular: 'haber',
    defaults: { href: 'https://arasmetal.com/', head_key: '', date_key: '', year: '', badge_key: '', award: false, active: true },
    head: (r, tr) => tr(r.head_key), meta: (r, tr) => <>{r.award && <Pill tone="ok">Ödül</Pill>}<span>{r.year || tr(r.date_key)}</span></>,
    fields: [{ k: 'head_key', l: 'Başlık', t: 'key' }, { k: 'date_key', l: 'Tarih', t: 'key' }, { k: 'year', l: 'Yıl (tarih yerine, opsiyonel)' }, { k: 'badge_key', l: 'Rozet', t: 'key' }, { k: 'href', l: 'Haber bağlantısı' }, { k: 'award', l: 'Ödül haberi', t: 'bool' }, { k: 'active', l: 'Yayında', t: 'bool' }],
  }} />
}
