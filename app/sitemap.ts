import type { MetadataRoute } from 'next';
import { getSeo } from '@/lib/seo';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com';

const PAGES: { path: string; freq: 'weekly' | 'monthly' | 'yearly'; priority: number }[] = [
  { path: '', freq: 'weekly', priority: 1 },
  { path: '/sss', freq: 'monthly', priority: 0.5 },
  { path: '/kariyer', freq: 'monthly', priority: 0.5 },
  { path: '/gizlilik', freq: 'yearly', priority: 0.3 },
  { path: '/cerez-politikasi', freq: 'yearly', priority: 0.2 },
  { path: '/kullanim-kosullari', freq: 'yearly', priority: 0.2 },
];

// Panelde "dizine ekleme" kapatılan sayfalar sitemap'ten çıkarılır.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSeo();
  return PAGES.filter((p) => !seo.pages[p.path || '/']?.noindex).map((p) => ({ url: `${SITE}${p.path}`, lastModified: new Date(), changeFrequency: p.freq, priority: p.priority, ...(p.path === '' ? { images: [`${SITE}/images/hero-home.webp`, `${SITE}/images/hero-garden.webp`, `${SITE}/images/about.webp`] } : {}) }));
}
