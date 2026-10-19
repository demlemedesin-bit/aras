import { revalidatePath, revalidateTag } from 'next/cache'
// Aras Metal web sitesi içeriği (aynı Supabase projesi). YALNIZCA sunucuda kullanın: service role anahtarı gerekir.
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const SITE_TABLES = ['site_texts', 'site_settings', 'site_collections', 'site_products', 'site_gallery_groups', 'site_gallery_images', 'site_news', 'site_partners', 'submissions', 'site_dealers', 'site_history', 'site_ad_spend', 'site_seo_keywords'] as const
export type SiteTable = (typeof SITE_TABLES)[number]
const PK: Record<SiteTable, string[]> = { site_texts: ['ns', 'key'], site_settings: ['key'], site_collections: ['id'], site_products: ['id'], site_gallery_groups: ['id'], site_gallery_images: ['id'], site_news: ['id'], site_partners: ['id'], submissions: ['id'], site_dealers: ['id'], site_history: ['id'], site_ad_spend: ['campaign'], site_seo_keywords: ['id'] }
export const pkOf = (t: SiteTable) => PK[t]

const h = (extra: Record<string, string> = {}) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...extra })
const check = async (r: Response) => { if (!r.ok) throw new Error(await r.text()); return r }

export async function siteSelect(table: SiteTable, order = 'sort') {
  const q = table === 'site_dealers' ? 'select=id,email,name,company,phone,status,lang,note,created_at,approved_at,last_login&order=created_at.desc&limit=500' : table === 'submissions' ? 'select=*&order=created_at.desc&limit=200' : `select=*&order=${order}`
  return (await check(await fetch(`${URL_}/rest/v1/${table}?${q}`, { headers: h(), cache: 'no-store' }))).json()
}
export async function siteUpsert(table: SiteTable, row: Record<string, unknown>) {
  const r = await check(await fetch(`${URL_}/rest/v1/${table}?on_conflict=${PK[table].join(',')}`, { method: 'POST', headers: h({ Prefer: 'resolution=merge-duplicates,return=representation' }), body: JSON.stringify(row) }))
  return r.json()
}
export async function siteUpdate(table: SiteTable, key: Record<string, string | number>, patch: Record<string, unknown>) {
  const q = PK[table].map((k) => `${k}=eq.${encodeURIComponent(String(key[k]))}`).join('&')
  await check(await fetch(`${URL_}/rest/v1/${table}?${q}`, { method: 'PATCH', headers: h(), body: JSON.stringify(patch) }))
}
export async function siteDelete(table: SiteTable, key: Record<string, string | number>) {
  const q = PK[table].map((k) => `${k}=eq.${encodeURIComponent(String(key[k]))}`).join('&')
  await check(await fetch(`${URL_}/rest/v1/${table}?${q}`, { method: 'DELETE', headers: h() }))
}
export async function siteCount(table: SiteTable, filter = '') {
  const r = await fetch(`${URL_}/rest/v1/${table}?select=*${filter ? '&' + filter : ''}`, { method: 'HEAD', headers: h({ Prefer: 'count=exact' }), cache: 'no-store' })
  if (!r.ok) throw new Error(`Supabase ${table} okunamadı (HTTP ${r.status}). SUPABASE_SERVICE_ROLE_KEY geçerli mi?`)
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

export async function siteRpc<T = unknown>(fn: string, args: Record<string, unknown>): Promise<T> {
  return (await check(await fetch(`${URL_}/rest/v1/rpc/${fn}`, { method: 'POST', headers: h(), body: JSON.stringify(args), cache: 'no-store' }))).json()
}

/** Sitenin ana sayfasını çekip temel SEO kontrollerini yapar. */
export async function seoAudit(base: string) {
  const root = base.replace(/\/$/, '')
  type Check = { id: string; label: string; status: 'ok' | 'warn' | 'bad'; detail: string }
  const checks: Check[] = []
  const t0 = Date.now()
  let html = '', status = 0
  try { const r = await fetch(root, { cache: 'no-store', headers: { 'User-Agent': 'ArasSeoCheck/1.0' } }); status = r.status; html = await r.text() } catch {}
  const ms = Date.now() - t0
  const meta = (re: RegExp) => html.match(re)?.[1]?.trim() ?? ''
  const attr = (name: string) => meta(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i')) || meta(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`, 'i'))
  const add = (id: string, label: string, status: Check['status'], detail: string) => checks.push({ id, label, status, detail })

  if (!status || status >= 400) { add('reach', 'Site erişilebilir', 'bad', `${root} adresi açılamadı (HTTP ${status || 'bağlantı yok'})`); return { url: root, ms, score: 0, checks } }
  add('reach', 'Site erişilebilir', 'ok', `HTTP ${status}, ${ms} ms`)
  add('https', 'HTTPS kullanılıyor', root.startsWith('https://') ? 'ok' : 'bad', root.startsWith('https://') ? 'Güvenli bağlantı' : 'Site HTTPS değil')
  const title = meta(/<title[^>]*>([^<]*)<\/title>/i)
  add('title', 'Sayfa başlığı', !title ? 'bad' : title.length < 30 || title.length > 60 ? 'warn' : 'ok', title ? `${title.length} karakter (ideal 30–60): ${title}` : 'Başlık yok')
  const desc = attr('description')
  add('desc', 'Meta açıklama', !desc ? 'bad' : desc.length < 110 || desc.length > 160 ? 'warn' : 'ok', desc ? `${desc.length} karakter (ideal 110–160)` : 'Açıklama yok')
  add('og', 'Sosyal paylaşım kartı (Open Graph)', attr('og:title') && attr('og:image') ? 'ok' : attr('og:title') ? 'warn' : 'bad', attr('og:image') ? 'Başlık ve görsel tanımlı' : 'Paylaşım görseli yok')
  add('robots', 'Arama motorlarına açık', /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html) ? 'bad' : 'ok', /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html) ? 'Site noindex ile gizli. SEO ayarlarından kapatın' : 'Dizine eklenebilir')
  add('canonical', 'Canonical adres', /<link[^>]+rel=["']canonical["']/i.test(html) ? 'ok' : 'warn', /<link[^>]+rel=["']canonical["']/i.test(html) ? 'Tanımlı' : 'Tanımlı değil')
  add('viewport', 'Mobil uyumluluk etiketi', attr('viewport') ? 'ok' : 'bad', attr('viewport') ? 'viewport tanımlı' : 'viewport yok')
  add('lang', 'Sayfa dili', meta(/<html[^>]+lang=["']([^"']+)["']/i) ? 'ok' : 'warn', meta(/<html[^>]+lang=["']([^"']+)["']/i) || 'lang etiketi yok')
  const h1 = (html.match(/<h1[\s>]/gi) || []).length
  add('jsonld', 'Yapılandırılmış veri (JSON-LD)', /application\/ld\+json/i.test(html) ? 'ok' : 'warn', /application\/ld\+json/i.test(html) ? 'Kurum bilgisi tanımlı' : 'Tanımlı değil')
  add('gsc', 'Google Search Console doğrulaması', attr('google-site-verification') ? 'ok' : 'warn', attr('google-site-verification') ? 'Doğrulama etiketi var' : 'Etiket yok. Aşağıdan doğrulama kodunu ekleyin')
  add('h1', 'Ana başlık (H1)', h1 === 1 ? 'ok' : h1 === 0 ? 'warn' : 'warn', h1 === 1 ? 'Tek H1 var' : h1 === 0 ? 'H1 bulunamadı' : `${h1} adet H1 var (1 olmalı)`)
  const imgs = html.match(/<img\b[^>]*>/gi) || []
  const noAlt = imgs.filter((i) => !/\balt=["'][^"']+["']/i.test(i)).length
  add('alt', 'Görsellerde alternatif metin', !imgs.length ? 'ok' : noAlt === 0 ? 'ok' : noAlt / imgs.length > 0.3 ? 'bad' : 'warn', imgs.length ? `${imgs.length} görselin ${noAlt} tanesinde alt metin yok` : 'Görsel bulunamadı')
  for (const [id, label, path] of [['robots', 'robots.txt', '/robots.txt'], ['sitemap', 'sitemap.xml', '/sitemap.xml']] as const) {
    try { const r = await fetch(root + path, { cache: 'no-store' }); add(id, label, r.ok ? 'ok' : 'bad', r.ok ? 'Mevcut' : `Bulunamadı (HTTP ${r.status})`) } catch { add(id, label, 'bad', 'Okunamadı') }
  }
  add('speed', 'Yanıt süresi', ms < 800 ? 'ok' : ms < 2000 ? 'warn' : 'bad', `${ms} ms`)
  const score = Math.round((checks.reduce((a, c) => a + (c.status === 'ok' ? 1 : c.status === 'warn' ? 0.5 : 0), 0) / checks.length) * 100)
  return { url: root, ms, score, checks }
}

/** Birden fazla sayfayı tarayıp sayfa bazında SEO özeti çıkarır. */
export async function seoPages(base: string, paths: string[]) {
  const root = base.replace(/\/$/, '')
  const out = []
  for (const path of paths.slice(0, 12)) {
    const t0 = Date.now()
    let html = '', status = 0
    try { const r = await fetch(root + path, { cache: 'no-store', headers: { 'User-Agent': 'ArasSeoCheck/1.0' } }); status = r.status; html = await r.text() } catch {}
    const ms = Date.now() - t0
    const pick = (re: RegExp) => html.match(re)?.[1]?.trim() ?? ''
    const attr = (n: string) => pick(new RegExp(`<meta[^>]+(?:name|property)=["']${n}["'][^>]*content=["']([^"']*)["']`, 'i')) || pick(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${n}["']`, 'i'))
    const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ')
    const words = body.split(/\s+/).filter((w) => w.length > 1).length
    const imgs = html.match(/<img\b[^>]*>/gi) || []
    out.push({
      path, status, ms,
      title: pick(/<title[^>]*>([^<]*)<\/title>/i), desc: attr('description'),
      h1: (html.match(/<h1[\s>]/gi) || []).length, h2: (html.match(/<h2[\s>]/gi) || []).length,
      words, images: imgs.length, noAlt: imgs.filter((i) => !/\balt=["'][^"']+["']/i.test(i)).length,
      canonical: /<link[^>]+rel=["']canonical["']/i.test(html), noindex: /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html),
      og: !!attr('og:image'), jsonld: /application\/ld\+json/i.test(html),
    })
  }
  return out
}
