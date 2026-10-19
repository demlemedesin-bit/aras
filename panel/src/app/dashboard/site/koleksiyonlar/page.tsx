'use client'
import ListManager from '@/components/site/ListManager'
import { Pill } from '@/components/site/ui'
export default function Page() {
  return <ListManager cfg={{
    table: 'site_collections', pk: 'id', title: 'Koleksiyonlar', sub: 'Ana sayfadaki koleksiyon satırları. Başlık ve açıklama Metinler sayfasındaki anahtarlardan gelir.', singular: 'koleksiyon', imgKey: 'img',
    defaults: { id: '', world: 'home', href: 'https://arasmetal.com/', title_key: '', desc_key: '', count: 0, img: '', pos: '', subs: [], active: true },
    head: (r, tr) => tr(r.title_key), meta: (r) => <><Pill tone="ac">{r.world === 'garden' ? 'Bahçe' : 'Ev'}</Pill><span>{r.count} ürün</span></>,
    fields: [{ k: 'id', l: 'Kimlik (değişmez, küçük harf)' }, { k: 'world', l: 'Bölüm', t: 'world' }, { k: 'title_key', l: 'Başlık', t: 'key' }, { k: 'desc_key', l: 'Açıklama', t: 'key' }, { k: 'href', l: 'Bağlantı' }, { k: 'img', l: 'Görsel', t: 'img' }, { k: 'pos', l: 'Görsel odağı (CSS, örn. center 60%)' }, { k: 'count', l: 'Ürün sayısı', t: 'num' }, { k: 'subs', l: 'Alt kategori anahtarları (virgülle)', help: 'Örn. k.1, k.2' }, { k: 'active', l: 'Yayında', t: 'bool' }],
  }} />
}
