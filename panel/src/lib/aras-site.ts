import { revalidatePath, revalidateTag } from 'next/cache'
// Aras Metal web sitesi içeriği (aynı Supabase projesi). YALNIZCA sunucuda kullanın: service role anahtarı gerekir.
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const SITE_TABLES = ['site_texts', 'site_settings', 'site_collections', 'site_products', 'site_gallery_groups', 'site_gallery_images', 'site_news', 'site_partners', 'submissions'] as const
export type SiteTable = (typeof SITE_TABLES)[number]
const PK: Record<SiteTable, string[]> = { site_texts: ['ns', 'key'], site_settings: ['key'], site_collections: ['id'], site_products: ['id'], site_gallery_groups: ['id'], site_gallery_images: ['id'], site_news: ['id'], site_partners: ['id'], submissions: ['id'] }
export const pkOf = (t: SiteTable) => PK[t]

const h = (extra: Record<string, string> = {}) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...extra })
const check = async (r: Response) => { if (!r.ok) throw new Error(await r.text()); return r }

export async function siteSelect(table: SiteTable, order = 'sort') {
  const q = table === 'submissions' ? 'select=*&order=created_at.desc&limit=200' : `select=*&order=${order}`
  return (await check(await fetch(`${URL_}/rest/v1/${table}?${q}`, { headers: h(), cache: 'no-store' }))).json()
}
export async function siteUpsert(table: SiteTable, row: Record<string, unknown>) {
  const r = await check(await fetch(`${URL_}/rest/v1/${table}?on_conflict=${PK[table].join(',')}`, { method: 'POST', headers: h({ Prefer: 'resolution=merge-duplicates,return=representation' }), body: JSON.stringify(row) }))
  return r.json()
}
export async function siteDelete(table: SiteTable, key: Record<string, string | number>) {
  const q = PK[table].map((k) => `${k}=eq.${encodeURIComponent(String(key[k]))}`).join('&')
  await check(await fetch(`${URL_}/rest/v1/${table}?${q}`, { method: 'DELETE', headers: h() }))
}
export async function siteCount(table: SiteTable, filter = '') {
  const r = await fetch(`${URL_}/rest/v1/${table}?select=*${filter ? '&' + filter : ''}`, { method: 'HEAD', headers: h({ Prefer: 'count=exact' }), cache: 'no-store' })
  return Number((r.headers.get('content-range') ?? '*/0').split('/')[1] || 0)
}
export async function siteUpload(path: string, file: Blob, contentType: string) {
  await check(await fetch(`${URL_}/storage/v1/object/site-media/${path}`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': contentType, 'x-upsert': 'true' }, body: file }))
  return `storage:${path}`
}
export async function siteListMedia() {
  const list = (await (await check(await fetch(`${URL_}/storage/v1/object/list/site-media`, { method: 'POST', headers: h(), body: JSON.stringify({ prefix: '', limit: 500, sortBy: { column: 'created_at', order: 'desc' } }) }))).json()) as { name: string; created_at?: string; metadata?: { size?: number } }[]
  return list.filter((f) => f.name && !f.name.startsWith('.')).map((f) => ({ name: f.name, path: `storage:${f.name}`, size: f.metadata?.size ?? 0, created_at: f.created_at ?? '' }))
}
export async function siteDeleteMedia(name: string) {
  await check(await fetch(`${URL_}/storage/v1/object/site-media`, { method: 'DELETE', headers: h(), body: JSON.stringify({ prefixes: [name] }) }))
}
/** Site ile panel aynı uygulamada: önbelleği doğrudan yenile. */
export async function siteRevalidate() {
  try { revalidateTag('site-content', { expire: 0 }); revalidatePath('/'); return true } catch { return false }
}
