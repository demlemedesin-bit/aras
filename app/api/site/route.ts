import { NextResponse } from 'next/server'
import { createClient } from '@panel/lib/supabase/server'
import { SITE_TABLES, siteCount, siteDelete, siteDeleteMedia, siteListMedia, siteRevalidate, siteSelect, siteUpload, siteUpsert, pkOf, type SiteTable } from '@panel/lib/aras-site'

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
    if (sp.get('unread')) return NextResponse.json({ unread: await siteCount('submissions', 'status=eq.new') })
    if (sp.get('stats')) {
      const [texts, collections, products, gallery, news, partners, subs] = await Promise.all([
        siteCount('site_texts'), siteCount('site_collections'), siteCount('site_products'), siteCount('site_gallery_images'),
        siteCount('site_news'), siteCount('site_partners'),
        siteSelect('submissions') as Promise<{ created_at: string; topic?: string; status?: string; country?: string }[]>,
      ])
      const inbox = subs.length
      const unread = subs.filter((m) => m.status === 'new').length
      const day = (d: Date) => d.toISOString().slice(0, 10)
      const today = new Date()
      const trend = Array.from({ length: 14 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() - (13 - i)); return { day: day(d), n: 0 } })
      const idx = Object.fromEntries(trend.map((t, i) => [t.day, i]))
      const countries: Record<string, number> = {}
      let catalog = 0, contact = 0, pending = 0
      for (const m of subs) {
        const i = idx[day(new Date(m.created_at))]
        if (i !== undefined) trend[i].n++
        if (m.topic === 'catalog') catalog++; else contact++
        if (m.status !== 'done') pending++
        const c = (m.country || '').trim()
        if (c) countries[c] = (countries[c] || 0) + 1
      }
      const topCountries = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([country, n]) => ({ country, n }))
      return NextResponse.json({ texts, collections, products, gallery, news, partners, inbox, unread, catalog, contact, pending, trend, topCountries, latest: subs.slice(0, 6) })
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
