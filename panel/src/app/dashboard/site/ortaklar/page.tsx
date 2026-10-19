'use client'
import ListManager from '@/components/site/ListManager'
export default function Page() {
  return <ListManager cfg={{
    table: 'site_partners', pk: 'id', title: 'İş ortakları', sub: 'Ana sayfadaki logo şeridi.', singular: 'ortak', imgKey: 'img',
    defaults: { name: '', href: 'https://', img: '', active: true },
    head: (r) => r.name,
    fields: [{ k: 'name', l: 'Ad' }, { k: 'href', l: 'Web sitesi' }, { k: 'img', l: 'Logo', t: 'img' }, { k: 'active', l: 'Yayında', t: 'bool' }],
  }} />
}
