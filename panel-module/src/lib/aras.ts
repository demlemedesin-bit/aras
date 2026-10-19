// Aras Metal sitesinin Supabase projesine (service role) erişim. YALNIZCA sunucuda kullanın.
const URL_ = process.env.ARAS_SUPABASE_URL!
const KEY = process.env.ARAS_SERVICE_ROLE_KEY!

export const ARAS_TABLES = [
  'site_texts', 'site_settings', 'site_collections', 'site_products',
  'site_gallery_groups', 'site_gallery_images', 'site_news', 'site_partners', 'submissions',
] as const
export type ArasTable = (typeof ARAS_TABLES)[number]

const PK: Record<ArasTable, string[]> = {
  site_texts: ['ns', 'key'], site_settings: ['key'], site_collections: ['id'], site_products: ['id'],
  site_gallery_groups: ['id'], site_gallery_images: ['id'], site_news: ['id'], site_partners: ['id'], submissions: ['id'],
}
export const pkOf = (t: ArasTable) => PK[t]

const h = (extra: Record<string, string> = {}) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...extra })

export async function arasSelect(table: ArasTable, order = 'sort') {
  const q = table === 'submissions' ? 'select=*&order=created_at.desc&limit=200' : `select=*&order=${order}`
  const r = await fetch(`${URL_}/rest/v1/${table}?${q}`, { headers: h(), cache: 'no-store' })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function arasUpsert(table: ArasTable, row: Record<string, unknown>) {
  const onConflict = PK[table].join(',')
  const r = await fetch(`${URL_}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST', headers: h({ Prefer: 'resolution=merge-duplicates,return=representation' }), body: JSON.stringify(row),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function arasDelete(table: ArasTable, key: Record<string, string | number>) {
  const q = PK[table].map((k) => `${k}=eq.${encodeURIComponent(String(key[k]))}`).join('&')
  const r = await fetch(`${URL_}/rest/v1/${table}?${q}`, { method: 'DELETE', headers: h() })
  if (!r.ok) throw new Error(await r.text())
}

export async function arasUpload(path: string, file: Blob, contentType: string) {
  const r = await fetch(`${URL_}/storage/v1/object/site-media/${path}`, {
    method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': contentType, 'x-upsert': 'true' }, body: file,
  })
  if (!r.ok) throw new Error(await r.text())
  return `storage:${path}`
}

/** Siteye "içerik değişti" haberi: önbelleği anında yeniler. */
export async function arasRevalidate() {
  const site = process.env.ARAS_SITE_URL, secret = process.env.ARAS_REVALIDATE_SECRET
  if (!site || !secret) return false
  try {
    const r = await fetch(`${site}/api/revalidate`, { method: 'POST', headers: { Authorization: `Bearer ${secret}` } })
    return r.ok
  } catch { return false }
}
