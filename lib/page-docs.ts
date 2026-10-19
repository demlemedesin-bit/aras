import data from './i18n-data.json';
import type { Lang } from './i18n';
import { CAREERS, FAQ, FAQ_LEAD, PRIVACY, type PageDoc } from './pages';
import { COOKIES, TERMS } from './legal';

export const PAGE_SLUGS = ['sss', 'gizlilik', 'cerez-politikasi', 'kullanim-kosullari', 'kariyer'] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];
export const PAGE_NAMES: Record<PageSlug, string> = { sss: 'Sık sorulan sorular', gizlilik: 'Gizlilik politikası', 'cerez-politikasi': 'Çerez politikası', 'kullanim-kosullari': 'Kullanım koşulları', kariyer: 'Kariyer' };
export type PagesOverride = Partial<Record<string, Partial<Record<Lang, PageDoc>>>>;

/** Koddaki varsayılan metin. Panelde düzenlenmemiş sayfalar bunu gösterir. */
export function defaultDoc(slug: PageSlug, lang: Lang): PageDoc {
  switch (slug) {
    case 'gizlilik': return PRIVACY[lang] ?? PRIVACY.en;
    case 'cerez-politikasi': return COOKIES[lang] ?? COOKIES.en;
    case 'kullanim-kosullari': return TERMS[lang] ?? TERMS.en;
    case 'sss': {
      const items = FAQ[lang] ?? FAQ.en;
      const title = (data.t as Record<string, Record<string, string>>)[lang]?.['ft.faq'] ?? 'FAQ';
      return { title, lead: FAQ_LEAD[lang], blocks: items.map((f) => ({ h: f.q, p: [f.a] })) };
    }
    case 'kariyer': {
      const c = CAREERS[lang] ?? CAREERS.en;
      return { title: c.title, lead: c.lead, blocks: [] };
    }
  }
}

export const resolveDoc = (o: PagesOverride | undefined, slug: PageSlug, lang: Lang): PageDoc => o?.[slug]?.[lang] ?? defaultDoc(slug, lang);
