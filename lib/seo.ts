import type { Metadata } from 'next';
import { type Lang, metaFor, tr as trans } from './i18n';
import { altLanguages, pathFor, OG_LOCALE } from './lang-path';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com';

export type PageSeo = { title?: string; desc?: string; og?: string; noindex?: boolean };
export type SeoCfg = { pages: Record<string, PageSeo>; robots: string[]; noindex: boolean };

const mediaUrl = (v?: string) => (!v ? undefined : v.startsWith('storage:') ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-media/${v.slice(8)}` : v);

/** Panelden girilen sayfa bazlı SEO ayarları, ek robots kuralları ve genel gizleme. */
export async function getSeo(): Promise<SeoCfg> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const empty: SeoCfg = { pages: {}, robots: [], noindex: false };
  if (!url || !key) return empty;
  try {
    const r = await fetch(`${url}/rest/v1/site_settings?key=in.(seo,seo_pages)&select=key,value`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 300, tags: ['site-content'] } });
    if (!r.ok) return empty;
    const rows = (await r.json()) as { key: string; value: any }[];
    const seo = rows.find((x) => x.key === 'seo')?.value ?? {};
    const pages = rows.find((x) => x.key === 'seo_pages')?.value ?? {};
    return { pages: typeof pages === 'object' && pages ? pages : {}, robots: Array.isArray(seo.robots_extra) ? seo.robots_extra.filter((x: unknown) => typeof x === 'string' && x.startsWith('/')) : [], noindex: seo.noindex === true };
  } catch {
    return empty;
  }
}

/** Alt sayfa metadata'sı: panel değeri varsa onu, yoksa varsayılanı kullanır. */
export async function pageMetadata(path: string, fallback: { title: string; desc?: string; key?: string }, lang: Lang = 'tr'): Promise<Metadata> {
  const s = await getSeo();
  const o = s.pages[path] ?? {};
  // Panelde girilen başlık/açıklama Türkçedir; diğer dillerde sözlükteki sayfa adı ve site açıklaması kullanılır.
  const title = (lang === 'tr' ? o.title?.trim() : '') || (lang === 'tr' || !fallback.key ? fallback.title : `${trans(lang, fallback.key)} | Aras Metal`);
  const description = (lang === 'tr' ? o.desc?.trim() : '') || (lang === 'tr' ? fallback.desc : metaFor(lang).desc);
  const here = pathFor(lang, path);
  const og = mediaUrl(o.og?.trim());
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: here, languages: altLanguages(path) },
    openGraph: { title, ...(description ? { description } : {}), url: here, siteName: 'Aras Metal', locale: OG_LOCALE[lang], type: 'website', ...(og ? { images: [{ url: og }] } : {}) },
    ...(o.noindex || s.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export const absolute = (path: string) => `${SITE}${path === '/' ? '' : path}`;
