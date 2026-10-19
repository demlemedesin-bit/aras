import type { MetadataRoute } from 'next'
import { getSeo } from '@/lib/seo'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeo()
  if (seo.noindex) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/login', '/admin', '/api', '/bayi', ...seo.robots] }],
    sitemap: `${SITE}/sitemap.xml`,
  }
}
