import { CODES, type Lang } from './i18n';

/** Türkçe (varsayılan) kökte, diğer diller /en, /de … ön ekiyle yayınlanır. */
export const OTHER: Lang[] = CODES.filter((c) => c !== 'tr');
export const OG_LOCALE: Record<Lang, string> = { tr: 'tr_TR', en: 'en_US', de: 'de_DE', fr: 'fr_FR', es: 'es_ES', it: 'it_IT' };
const RE = new RegExp(`^/(${OTHER.join('|')})(?=/|$)`);

export const stripLang = (path: string) => path.replace(RE, '') || '/';
export const pathFor = (lang: string, path: string) => {
  const p = stripLang(path);
  return lang === 'tr' ? p : p === '/' ? `/${lang}` : `/${lang}${p}`;
};
/** Site içi bağlantıyı dile göre ön ekler; katalog, bağlantı dışı ve çapa adresleri olduğu gibi kalır. */
export const lp = (lang: string, href: string) => (lang === 'tr' || !href.startsWith('/') || href.startsWith('//') || href.startsWith('/bayi') || href.startsWith('/api') ? href : pathFor(lang, href));
/** hreflang eşleşmeleri (x-default Türkçe). */
export const altLanguages = (path: string): Record<string, string> => ({ ...Object.fromEntries(CODES.map((c) => [c, pathFor(c, path)])), 'x-default': pathFor('tr', path) });
export const isLang = (v: string): v is Lang => (OTHER as string[]).includes(v);
