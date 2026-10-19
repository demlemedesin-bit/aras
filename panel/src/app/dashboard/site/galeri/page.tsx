'use client'
import ListManager from '@/components/site/ListManager'
import { Pill } from '@/components/site/ui'
export default function Page() {
  return <ListManager cfg={{
    table: 'site_gallery_images', pk: 'id', title: 'Galeri', sub: 'Ürün galerisi görselleri. Grup (sekme) kimliği: bread, pitchers, storage, trays, lifestyle, bathroom, pet.', singular: 'görsel', imgKey: 'src', filterKey: 'group_id',
    defaults: { group_id: 'lifestyle', src: '', alt: {}, active: true },
    head: (r) => `#${r.id}`, meta: (r) => <Pill tone="mute">{r.group_id}</Pill>,
    fields: [{ k: 'group_id', l: 'Grup kimliği' }, { k: 'src', l: 'Görsel', t: 'img' }, { k: 'active', l: 'Yayında', t: 'bool' }],
  }} />
}
