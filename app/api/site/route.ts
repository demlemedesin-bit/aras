import { NextResponse } from 'next/server'
import { createClient } from '@panel/lib/supabase/server'
import { hashPw } from '@/lib/dealer-server'
import { buildReport, buildRealtime, type Sub } from '@panel/lib/analytics'
import { SITE_TABLES, seoAudit, seoPages, siteRpc, siteCount, siteDelete, siteDeleteMedia, siteListMedia, siteRevalidate, siteSelect, siteUpload, siteUpsert, siteUpdate, pkOf, type SiteTable } from '@panel/lib/aras-site'

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
const ORDER: Record<string, string> = { site_texts: 'ns,key', site_settings: 'key', site_ad_spend: 'campaign', site_seo_keywords: 'keyword', site_prices: 'product_id' }

export async function GET(req: Request) {
  if (!(await guard())) return fail('Yetkisiz', 401)
  const sp = new URL(req.url).searchParams
  try {
    if (sp.get('media')) return NextResponse.json({ files: await siteListMedia() })
    if (sp.get('report')) {
      const days = Math.min(90, Math.max(1, Number(sp.get('days')) || 14))
      const subs = (await siteSelect('submissions')) as Sub[]
      return NextResponse.json(await buildReport(days, subs))
    }
    if (sp.get('realtime')) return NextResponse.json(await buildRealtime())
    if (sp.get('analytics')) {
      const days = Math.min(90, Math.max(1, Number(sp.get('days')) || 14))
      const [a, subs] = await Promise.all([
        siteRpc<Record<string, any>>('site_analytics', { p_days: days }),
        siteSelect('submissions') as Promise<{ created_at: string }[]>,
      ])
      const since = Date.now() - days * 86400000
      const requests = subs.filter((m) => new Date(m.created_at).getTime() >= since).length
      const prevReq = subs.filter((m) => { const t = new Date(m.created_at).getTime(); return t < since && t >= since - days * 86400000 }).length
      return NextResponse.json({ ...a, days, requests, prevRequests: prevReq })
    }
    if (sp.get('seopages')) return NextResponse.json({ pages: await seoPages(process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com', (sp.get('seopages') || '/').split(',').filter((x) => x.startsWith('/'))) })
    if (sp.get('seo')) return NextResponse.json(await seoAudit(process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com'))
    if (sp.get('unread')) {
      const [unread, dealers, quotes] = await Promise.all([
        siteCount('submissions', 'status=eq.new'),
        siteCount('site_dealers', 'status=eq.pending').catch(() => 0),
        siteCount('submissions', 'items=not.is.null&stage=eq.new').catch(() => 0),
      ])
      return NextResponse.json({ unread, dealers, quotes })
    }
    if (sp.get('stats')) {
      const dealersPending = await siteCount('site_dealers', 'status=eq.pending').catch(() => 0)
      const [textRows, collRows, prodRows, gallery, newsRows, partners, subs] = await Promise.all([
        siteSelect('site_texts', 'ns,key') as Promise<{ value?: Record<string, string> }[]>,
        siteSelect('site_collections') as Promise<{ active?: boolean; img?: string }[]>,
        siteSelect('site_products') as Promise<{ active?: boolean; img?: string }[]>,
        siteCount('site_gallery_images'),
        siteSelect('site_news') as Promise<{ active?: boolean }[]>,
        siteCount('site_partners'),
        siteSelect('submissions') as Promise<{ created_at: string; topic?: string; status?: string; country?: string }[]>,
      ])
      const texts = textRows.length, collections = collRows.length, products = prodRows.length, news = newsRows.length
      const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'it']
      const missingTr = textRows.filter((t) => LANGS.some((l) => !String(t.value?.[l] ?? '').trim())).length
      const noImg = prodRows.filter((p) => !p.img).length + collRows.filter((c) => !c.img).length
      const passive = prodRows.filter((p) => p.active === false).length
      const stale = subs.filter((m) => m.status === 'new' && Date.now() - new Date(m.created_at).getTime() > 48 * 3600 * 1000).length
      const read = subs.filter((m) => m.status === 'read').length
      const done = subs.filter((m) => m.status === 'done').length
      const todayKey = new Date().toISOString().slice(0, 10)
      const today_n = subs.filter((m) => m.created_at.slice(0, 10) === todayKey).length
      const week_n = subs.filter((m) => Date.now() - new Date(m.created_at).getTime() < 7 * 86400000).length
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
      const history = await siteCount('site_history').catch(() => 0)
      return NextResponse.json({ history, texts, collections, products, gallery, news, partners, inbox, unread, catalog, contact, pending, trend, topCountries, latest: subs.slice(0, 6), read, done, today: today_n, week: week_n, dealersPending, alerts: { stale, missingTr, noImg, passive } })
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
    if (action === 'dealer') {
      const st = ['pending', 'approved', 'rejected'].includes(row?.status) ? row.status : null
      if (!row?.id || !st) return fail('Geçersiz istek', 400)
      await siteUpdate('site_dealers', { id: row.id }, { status: st, note: typeof row.note === 'string' ? row.note.slice(0, 500) : null, approved_at: st === 'approved' ? new Date().toISOString() : null })
      return NextResponse.json({ ok: true })
    }
    if (action === 'dealer-pw') {
      const pw = typeof row?.password === 'string' && row.password.length >= 8 ? row.password.slice(0, 100) : null
      if (!row?.id || !pw) return fail('Şifre en az 8 karakter olmalı', 400)
      await siteUpdate('site_dealers', { id: row.id }, { pw_hash: await hashPw(pw) })
      return NextResponse.json({ ok: true })
    }
    if (action === 'quote') {
      const STAGES = ['new', 'review', 'quoted', 'won', 'lost']
      if (!row?.id || !STAGES.includes(row.stage)) return fail('Geçersiz istek', 400)
      const amt = row.quote_amount === '' || row.quote_amount == null ? null : Number(row.quote_amount)
      if (amt !== null && !Number.isFinite(amt)) return fail('Tutar geçersiz', 400)
      await siteUpdate('submissions', { id: row.id }, {
        stage: row.stage, quote_amount: amt, quote_currency: ['TRY', 'USD', 'EUR'].includes(row.quote_currency) ? row.quote_currency : 'TRY',
        internal_note: typeof row.internal_note === 'string' ? row.internal_note.slice(0, 2000) : null, status: row.stage === 'new' ? 'new' : 'read', updated_at: new Date().toISOString(),
      })
      return NextResponse.json({ ok: true })
    }
    if (action === 'prices') {
      const rows = Array.isArray(row) ? row : []
      if (!rows.length || rows.length > 1000) return fail('Geçersiz istek', 400)
      for (const r of rows) {
        const price = r.price === '' || r.price == null ? null : Number(r.price)
        if (!r.product_id || (price !== null && (!Number.isFinite(price) || price < 0))) return fail(`Geçersiz satır: ${r.product_id ?? '?'}`, 400)
        await siteUpsert('site_prices', {
          product_id: String(r.product_id), price, currency: ['TRY', 'USD', 'EUR'].includes(r.currency) ? r.currency : 'TRY', unit: String(r.unit || 'adet').slice(0, 20),
          stock: ['in', 'low', 'out', 'order'].includes(r.stock) ? r.stock : 'in', min_qty: r.min_qty ? Math.max(1, Math.floor(Number(r.min_qty))) : null, note: r.note ? String(r.note).slice(0, 200) : null, updated_at: new Date().toISOString(),
        })
      }
      return NextResponse.json({ ok: true })
    }
    if (!isTable(table)) return fail('Geçersiz istek', 400)
    if (table === 'site_dealers' && action === 'upsert') return fail('Geçersiz işlem', 400)
    if (action === 'upsert') await siteUpsert(table, row)
    else if (action === 'delete') await siteDelete(table, Object.fromEntries(pkOf(table).map((k) => [k, row[k]])))
    else return fail('Geçersiz işlem', 400)
    const revalidated = table === 'submissions' || table === 'site_dealers' ? null : (await siteRevalidate())
    return NextResponse.json({ ok: true, revalidated })
  } catch (e) { return fail(e) }
}
