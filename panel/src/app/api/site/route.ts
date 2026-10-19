import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SITE_TABLES, siteCount, siteDelete, siteDeleteMedia, siteListMedia, siteRevalidate, siteSelect, siteUpload, siteUpsert, pkOf, type SiteTable } from '@/lib/aras-site'

// Yalnızca giriş yapmış admin/manager rolü site içeriğini düzenleyebilir.
async function guard() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return false
  const { data } = await sb.from('profiles').select('role').eq('id', user.id).single()
  return data?.role === 'admin' || data?.role === 'manager'
}
const isTable = (t: unknown): t is SiteTable => typeof t === 'string' && (SITE_TABLES as readonly string[]).includes(t)
const fail = (e: unknown, s = 500) => NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: s })
const ORDER: Record<string, string> = { site_texts: 'ns,key', site_settings: 'key' }

export async function GET(req: Request) {
  if (!(await guard())) return fail('Yetkisiz', 401)
  const sp = new URL(req.url).searchParams
  try {
    if (sp.get('media')) return NextResponse.json({ files: await siteListMedia() })
    if (sp.get('stats')) {
      const [texts, collections, products, gallery, news, partners, inbox, unread] = await Promise.all([
        siteCount('site_texts'), siteCount('site_collections'), siteCount('site_products'), siteCount('site_gallery_images'),
        siteCount('site_news'), siteCount('site_partners'), siteCount('submissions'), siteCount('submissions', 'status=eq.new'),
      ])
      const latest = (await siteSelect('submissions')).slice(0, 5)
      return NextResponse.json({ texts, collections, products, gallery, news, partners, inbox, unread, latest })
    }
    const table = sp.get('table')
    if (!isTable(table)) return fail('Geçersiz tablo', 400)
    return NextResponse.json({ rows: await siteSelect(table, ORDER[table] ?? 'sort') })
  } catch (e) { return fail(e) }
}

export async function POST(req: Request) {
  if (!(await guard())) return fail('Yetkisiz', 401)
  if (req.headers.get('content-type')?.startsWith('multipart/form-data')) {
    const fd = await req.formData(); const f = fd.get('file')
    if (!(f instanceof File)) return fail('Dosya yok', 400)
    if (f.size > 8 * 1024 * 1024) return fail('Dosya 8 MB üstünde', 400)
    const safe = f.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')
    try { return NextResponse.json({ path: await siteUpload(`${Date.now()}-${safe}`, f, f.type || 'application/octet-stream') }) } catch (e) { return fail(e) }
  }
  const { action, table, row, name } = await req.json().catch(() => ({}))
  try {
    if (action === 'revalidate') return NextResponse.json({ ok: true, revalidated: (await siteRevalidate()) })
    if (action === 'delete-media') { await siteDeleteMedia(String(name)); return NextResponse.json({ ok: true }) }
    if (!isTable(table)) return fail('Geçersiz istek', 400)
    if (action === 'upsert') await siteUpsert(table, row)
    else if (action === 'delete') await siteDelete(table, Object.fromEntries(pkOf(table).map((k) => [k, row[k]])))
    else return fail('Geçersiz işlem', 400)
    const revalidated = table === 'submissions' ? null : (await siteRevalidate())
    return NextResponse.json({ ok: true, revalidated })
  } catch (e) { return fail(e) }
}
