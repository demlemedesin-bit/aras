import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com'

// Panelde "Siteyi arama motorlarından gizle" açıksa tüm site kapatılır.
async function hidden() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false
  try {
    const r = await fetch(`${url}/rest/v1/site_settings?key=eq.seo&select=value`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 300, tags: ['site-content'] } })
    return (await r.json())?.[0]?.value?.noindex === true
  } catch {
    return false
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (await hidden()) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/login', '/admin', '/api'] }],
    sitemap: `${SITE}/sitemap.xml`,
  }
}
