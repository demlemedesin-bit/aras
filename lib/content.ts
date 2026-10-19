import data from './i18n-data.json';
import { COLLECTIONS, PRODUCTS, GALLERY_GROUPS, GALLERY, NEWS, PARTNERS, CONTACT, HERO } from './data';
import type { Lang, Dict } from './i18n';

/** Sitenin tüm yönetilebilir içeriği. Kaynak: Supabase (panelden düzenlenir); ulaşılamazsa gömülü varsayılanlar. */
export type Content = {
  texts: Record<'t' | 'ui' | 'auth' | 'meta', Record<string, Partial<Record<Lang, string>>>>;
  collections: { id: string; world: 'home' | 'garden'; href: string; title: string; desc: string; count: number; img: string; pos?: string; subs?: string[] }[];
  products: { id: string; code: string; name: string; cat: string; world: 'home' | 'garden'; img: string; href: string }[];
  gallery: { src: string; group: string; label: string; n: number; alt?: Partial<Record<Lang, string>> }[];
  galleryGroups: { id: string; label: string }[];
  news: { href: string; d: string; year?: string; h: string; badge?: string; award?: boolean }[];
  partners: { name: string; href: string; img: string }[];
  hero: { showroom: string; home: string; garden: string };
  contact: typeof CONTACT;
};

const pivot = (byLang: Record<string, Record<string, string>>) => {
  const m: Record<string, Partial<Record<Lang, string>>> = {};
  for (const [l, d] of Object.entries(byLang)) for (const [k, v] of Object.entries(d)) (m[k] ??= {})[l as Lang] = v;
  return m;
};
const metaPivot = () => {
  const m: Record<string, Partial<Record<Lang, string>>> = {};
  for (const [l, v] of Object.entries(data.meta as Record<string, { title: string; desc: string }>)) for (const [k, x] of Object.entries(v)) (m[k] ??= {})[l as Lang] = x;
  return m;
};

export const FALLBACK: Content = {
  texts: { t: pivot(data.t), ui: pivot(data.ui), auth: pivot(data.auth), meta: metaPivot() },
  collections: COLLECTIONS.map((c) => ({ ...c, subs: c.subs ? [...c.subs] : undefined })),
  products: PRODUCTS.map((p) => ({ ...p })),
  gallery: GALLERY.map((g) => ({ ...g })),
  galleryGroups: GALLERY_GROUPS.map((g) => ({ id: g.id, label: g.label })),
  news: NEWS.map((n) => ({ href: n.href, d: n.d, year: 'year' in n ? n.year : undefined, h: n.h, badge: 'badge' in n ? n.badge : undefined, award: 'award' in n ? n.award : false })),
  partners: PARTNERS.map((p) => ({ ...p })),
  hero: { ...HERO },
  contact: CONTACT,
};

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Görsel yolları: '/images/..' yerel, 'storage:..' veya mutlak URL olduğu gibi. */
export const media = (p: string) => (p && p.startsWith('storage:') && URL_ ? `${URL_}/storage/v1/object/public/site-media/${p.slice(8)}` : p);

async function rest<T>(table: string, query = 'select=*'): Promise<T[]> {
  const r = await fetch(`${URL_}/rest/v1/${table}?${query}`, {
    headers: { apikey: KEY!, Authorization: `Bearer ${KEY}` },
    next: { revalidate: 300, tags: ['site-content'] },
  });
  if (!r.ok) throw new Error(`${table}: ${r.status}`);
  return r.json();
}

const resolveMedia = (c: Content): Content => ({
  ...c,
  collections: c.collections.map((x) => ({ ...x, img: media(x.img) })),
  products: c.products.map((x) => ({ ...x, img: media(x.img) })),
  gallery: c.gallery.map((x) => ({ ...x, src: media(x.src) })),
  partners: c.partners.map((x) => ({ ...x, img: media(x.img) })),
  hero: { showroom: media(c.hero.showroom), home: media(c.hero.home), garden: media(c.hero.garden) },
});

export async function getContent(): Promise<Content> {
  if (!URL_ || !KEY) return FALLBACK;
  try {
    const act = 'active=eq.true&order=sort';
    const [texts, settings, cols, prods, groups, imgs, news, partners] = await Promise.all([
      rest<{ ns: string; key: string; value: Record<string, string> }>('site_texts'),
      rest<{ key: string; value: any }>('site_settings'),
      rest<any>('site_collections', `select=*&${act}`),
      rest<any>('site_products', `select=*&${act}`),
      rest<any>('site_gallery_groups', `select=*&${act}`),
      rest<any>('site_gallery_images', `select=*&${act}`),
      rest<any>('site_news', `select=*&${act}`),
      rest<any>('site_partners', `select=*&${act}`),
    ]);
    if (!texts.length) return FALLBACK;
    const out: Content = { ...FALLBACK, texts: { t: { ...FALLBACK.texts.t }, ui: { ...FALLBACK.texts.ui }, auth: { ...FALLBACK.texts.auth }, meta: { ...FALLBACK.texts.meta } } };
    for (const r of texts) if (r.ns in out.texts) out.texts[r.ns as keyof Content['texts']][r.key] = r.value;
    const s = Object.fromEntries(settings.map((x) => [x.key, x.value]));
    if (s.hero) out.hero = { ...FALLBACK.hero, ...s.hero };
    if (s.contact) out.contact = { ...FALLBACK.contact, ...s.contact };
    if (cols.length) out.collections = cols.map((c: any) => ({ id: c.id, world: c.world, href: c.href, title: c.title_key, desc: c.desc_key, count: c.count, img: c.img, pos: c.pos ?? undefined, subs: c.subs?.length ? c.subs : undefined }));
    if (prods.length) out.products = prods.map((p: any) => ({ id: p.id, code: p.code, name: p.name_key, cat: p.cat_key, world: p.world, img: p.img, href: p.href }));
    if (groups.length) {
      out.galleryGroups = groups.map((g: any) => ({ id: g.id, label: g.label_key }));
      const label = Object.fromEntries(groups.map((g: any) => [g.id, g.label_key]));
      const cnt: Record<string, number> = {};
      out.gallery = imgs.filter((i: any) => label[i.group_id]).map((i: any) => ({ src: i.src, group: i.group_id, label: label[i.group_id], n: (cnt[i.group_id] = (cnt[i.group_id] ?? 0) + 1), alt: i.alt }));
    }
    if (news.length) out.news = news.map((n: any) => ({ href: n.href, d: n.date_key ?? '', year: n.year ?? undefined, h: n.head_key, badge: n.badge_key ?? undefined, award: n.award }));
    if (partners.length) out.partners = partners.map((p: any) => ({ name: p.name, href: p.href, img: p.img }));
    return resolveMedia(out);
  } catch (e) {
    console.error('[content] Supabase okunamadı, varsayılan içerik kullanılıyor:', e);
    return FALLBACK;
  }
}

/** Bir dilin sözlüğü; eksik anahtarlar Türkçe'ye düşer. */
export const dictFor = (c: Content, ns: keyof Content['texts'], lang: Lang): Dict => {
  const o: Dict = {};
  for (const [k, v] of Object.entries(c.texts[ns])) {
    const x = v[lang] ?? v.tr;
    if (x != null) o[k] = x;
  }
  return o;
};
