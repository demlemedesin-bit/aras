'use client'
import ListManager from '@panel/components/site/ListManager'
import { Pill } from '@panel/components/site/ui'
export default function Page() {
  return <ListManager cfg={{
    table: 'site_products', pk: 'id', title: 'Öne çıkan ürünler', sub: 'Ana sayfadaki ürün şeridi.', singular: 'ürün', imgKey: 'img',
    defaults: { id: '', code: '', name_key: '', cat_key: 'c1.t', world: 'home', img: '', active: true },
    head: (r, tr) => `${r.code} · ${tr(r.name_key)}`, meta: (r, tr) => <><Pill tone="ac">{r.world === 'garden' ? 'Bahçe' : 'Ev'}</Pill><span>{tr(r.cat_key)}</span></>,
    fields: [{ k: 'id', l: 'Kimlik (değişmez)' }, { k: 'code', l: 'Ürün kodu' }, { k: 'name_key', l: 'Ürün adı', t: 'key' }, { k: 'cat_key', l: 'Kategori', t: 'key' }, { k: 'world', l: 'Bölüm', t: 'world' }, { k: 'img', l: 'Görsel', t: 'img' }, { k: 'active', l: 'Yayında', t: 'bool' }],
  }} />
}
