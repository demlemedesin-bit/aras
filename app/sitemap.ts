import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/sss`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/kariyer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/cerez-politikasi`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/kullanim-kosullari`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/gizlilik`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
