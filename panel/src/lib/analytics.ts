// Ham ziyaret kayıtlarından rapor üretir (YALNIZCA sunucuda). Saat dilimi: Türkiye (UTC+3, yaz saati yok).
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` }
const TZ = 3 * 3600 * 1000
const MAX_ROWS = 80000

export type VRow = {
  id: number; ts: string; path: string; lang: string | null; country: string | null; referrer: string | null; device: string | null
  vid: string; kind: string; name: string | null; sid?: string | null; uid?: string | null; meta?: Record<string, any> | null
}
export type Sub = { id: number | string; created_at: string; topic?: string; country?: string; status?: string }

const CONVERSIONS = ['catalog_submit', 'contact_submit', 'dealer_register']
export const CHANNELS = ['Doğrudan', 'Organik arama', 'Sosyal medya', 'Reklam', 'E-posta', 'Yönlendirme'] as const

const SEARCH = /(^|\.)(google|bing|yandex|duckduckgo|yahoo|ecosia|baidu|naver|qwant|startpage|ask|brave|seznam)\./i
const SOCIAL = /(facebook|instagram|linkedin|twitter|t\.co|x\.com|pinterest|youtube|youtu\.be|tiktok|whatsapp|wa\.me|reddit|telegram|snapchat|threads)/i

export async function fetchViews(sinceIso: string, untilIso?: string): Promise<VRow[]> {
  const out: VRow[] = []
  const step = 1000
  for (let off = 0; off < MAX_ROWS; off += step) {
    const q = `select=*&ts=gte.${encodeURIComponent(sinceIso)}${untilIso ? `&ts=lt.${encodeURIComponent(untilIso)}` : ''}&order=ts.desc&limit=${step}&offset=${off}`
    const r = await fetch(`${URL_}/rest/v1/site_views?${q}`, { headers: H, cache: 'no-store' })
    if (!r.ok) throw new Error(`site_views okunamadı (HTTP ${r.status})`)
    const rows = (await r.json()) as VRow[]
    out.push(...rows)
    if (rows.length < step) break
  }
  return out
}

/** Dönemden önce görülmüş kalıcı ziyaretçi kodları (tekrar gelen ziyaretçi tespiti için). */
async function priorUids(beforeIso: string, uids: string[]): Promise<Set<string>> {
  const seen = new Set<string>()
  for (let i = 0; i < uids.length; i += 200) {
    const part = uids.slice(i, i + 200).map((u) => `"${u}"`).join(',')
    const r = await fetch(`${URL_}/rest/v1/site_views?select=uid&ts=lt.${encodeURIComponent(beforeIso)}&uid=in.(${part})&limit=1000`, { headers: H, cache: 'no-store' })
    if (r.ok) for (const x of (await r.json()) as { uid: string }[]) seen.add(x.uid)
  }
  return seen
}

const local = (iso: string) => new Date(new Date(iso).getTime() + TZ)
const dayKey = (iso: string) => local(iso).toISOString().slice(0, 10)

type Sess = {
  key: string; sid: string; uid: string | null; vid: string; rows: VRow[]; first: string; last: string
  country: string | null; city?: string; device: string; browser?: string; os?: string; lang?: string | null
  source: string; medium?: string; campaign?: string; term?: string; content?: string; click?: string; channel: string; referrer: string
  entry: string; exit: string; views: number; dur: number; events: string[]; converted: boolean
  pages: { path: string; ts: string; dur: number }[]
}

function channelOf(ref: string, m: Record<string, any>): { channel: string; source: string } {
  const med = String(m.m || '').toLowerCase()
  const src = String(m.s || '').toLowerCase()
  const label = m.s || ref || 'Doğrudan'
  if (m.k || /^(cpc|ppc|paid|paidsearch|paid_social|paidsocial|display|banner|retargeting)/.test(med)) return { channel: 'Reklam', source: label }
  if (/mail|newsletter|bülten|bulten/.test(med) || /mail|newsletter/.test(src)) return { channel: 'E-posta', source: label }
  if (med === 'social' || med === 'sosyal' || SOCIAL.test(src) || (ref && SOCIAL.test(ref))) return { channel: 'Sosyal medya', source: label }
  if (med === 'organic' || (ref && SEARCH.test(ref + '.')) || SEARCH.test(src + '.')) return { channel: 'Organik arama', source: label }
  if (ref) return { channel: 'Yönlendirme', source: label }
  if (m.s) return { channel: 'Yönlendirme', source: label }
  return { channel: 'Doğrudan', source: 'Doğrudan' }
}

function sessionize(rows: VRow[]): Sess[] {
  const map = new Map<string, VRow[]>()
  for (const r of rows) {
    const key = r.sid ? `s:${r.sid}` : `v:${r.vid}:${dayKey(r.ts)}`
    const a = map.get(key)
    if (a) a.push(r); else map.set(key, [r])
  }
  const out: Sess[] = []
  for (const [key, list] of map) {
    list.sort((a, b) => a.ts.localeCompare(b.ts))
    const views = list.filter((r) => r.kind === 'view')
    const head = views.find((r) => r.meta?.entry) ?? views[0] ?? list[0]
    const meta = (head.meta ?? {}) as Record<string, any>
    const { channel, source } = channelOf(head.referrer || '', meta)
    const pages: Sess['pages'] = views.map((v) => ({ path: v.path, ts: v.ts, dur: 0 }))
    let dur = 0
    for (const r of list) {
      if (r.kind !== 'leave') continue
      const d = Number(r.meta?.dur) || 0
      dur += d
      for (let i = pages.length - 1; i >= 0; i--) if (pages[i].path === r.path) { pages[i].dur += d; break }
    }
    const events = list.filter((r) => r.kind === 'event' && r.name).map((r) => r.name as string)
    const any = list.find((r) => r.meta?.city || r.meta?.browser)?.meta ?? {}
    out.push({
      key, sid: r0(list).sid ?? key, uid: list.find((r) => r.uid)?.uid ?? null, vid: head.vid, rows: list,
      first: list[0].ts, last: list[list.length - 1].ts, country: head.country, city: any.city, device: head.device || 'desktop',
      browser: any.browser, os: any.os, lang: head.lang, source, medium: meta.m, campaign: meta.c, term: meta.t, content: meta.n, click: meta.k, channel,
      referrer: head.referrer || '', entry: views[0]?.path ?? head.path, exit: views[views.length - 1]?.path ?? head.path,
      views: views.length, dur, events, converted: events.some((e) => CONVERSIONS.includes(e)), pages,
    })
  }
  return out.filter((s) => s.views > 0 || s.events.length > 0)
}
const r0 = (l: VRow[]) => l[0]

const top = <T,>(m: Map<string, T>, by: (v: T) => number, n = 15) => [...m.entries()].sort((a, b) => by(b[1]) - by(a[1])).slice(0, n)
const inc = (m: Map<string, number>, k: string, by = 1) => m.set(k, (m.get(k) ?? 0) + by)
const arr = (m: Map<string, number>, key: string, n = 12) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ [key]: k, n: v }))

function totals(ss: Sess[]) {
  const visitors = new Set(ss.map((s) => s.uid ?? s.vid)).size
  const views = ss.reduce((a, s) => a + s.views, 0)
  const single = ss.filter((s) => s.views <= 1 && s.events.length === 0).length
  const timed = ss.filter((s) => s.dur > 0)
  return {
    visitors, sessions: ss.length, views,
    pagesPerSession: ss.length ? +(views / ss.length).toFixed(2) : 0,
    bounce: ss.length ? +((single / ss.length) * 100).toFixed(1) : 0,
    avgDur: timed.length ? Math.round(timed.reduce((a, s) => a + s.dur, 0) / timed.length) : 0,
    conversions: ss.filter((s) => s.converted).length,
  }
}

export async function buildReport(days: number, subs: Sub[]) {
  const now = Date.now()
  const start = new Date(now - days * 86400000)
  const prevStart = new Date(now - days * 2 * 86400000)
  const all = await fetchViews(prevStart.toISOString())
  const cur = all.filter((r) => r.ts >= start.toISOString())
  const prev = all.filter((r) => r.ts < start.toISOString())
  const ss = sessionize(cur)
  const ps = sessionize(prev)
  const T = totals(ss)
  const P = totals(ps)

  // Yeni / tekrar gelen
  const uids = [...new Set(ss.filter((s) => s.uid).map((s) => s.uid as string))]
  const before = await priorUids(start.toISOString(), uids).catch(() => new Set<string>())
  const perUid = new Map<string, Sess[]>()
  for (const s of ss) if (s.uid) perUid.set(s.uid, [...(perUid.get(s.uid) ?? []), s])
  const returningUid = new Set(uids.filter((u) => before.has(u) || (perUid.get(u)?.length ?? 0) > 1))
  const kitle = { new: uids.length - returningUid.size, returning: returningUid.size, anonymous: new Set(ss.filter((s) => !s.uid).map((s) => s.vid)).size }

  // Günlük seri
  const dayList: string[] = []
  for (let i = days - 1; i >= 0; i--) dayList.push(new Date(now + TZ - i * 86400000).toISOString().slice(0, 10))
  const byDay = new Map(dayList.map((d) => [d, { day: d, visitors: new Set<string>(), sessions: 0, views: 0, conv: 0 }]))
  for (const s of ss) {
    const d = byDay.get(dayKey(s.first))
    if (!d) continue
    d.visitors.add(s.uid ?? s.vid); d.sessions++; d.views += s.views; if (s.converted) d.conv++
  }
  const daily = [...byDay.values()].map((d) => ({ day: d.day, visitors: d.visitors.size, sessions: d.sessions, views: d.views, conv: d.conv }))

  // Saat ve haftanın günü
  const hours = Array<number>(24).fill(0)
  const weekdays = Array<number>(7).fill(0)
  const heat = Array.from({ length: 7 }, () => Array<number>(24).fill(0))
  for (const r of cur) {
    if (r.kind !== 'view') continue
    const l = local(r.ts)
    const wd = (l.getUTCDay() + 6) % 7
    hours[l.getUTCHours()]++; weekdays[wd]++; heat[wd][l.getUTCHours()]++
  }

  // Sayfalar
  const pg = new Map<string, { path: string; views: number; vis: Set<string>; dur: number; durN: number; entries: number; exits: number; bounces: number; conv: number }>()
  const P0 = (p: string) => { let x = pg.get(p); if (!x) { x = { path: p, views: 0, vis: new Set(), dur: 0, durN: 0, entries: 0, exits: 0, bounces: 0, conv: 0 }; pg.set(p, x) } return x }
  for (const s of ss) {
    s.pages.forEach((p, i) => {
      const x = P0(p.path)
      x.views++; x.vis.add(s.uid ?? s.vid)
      if (p.dur) { x.dur += p.dur; x.durN++ }
      if (i === 0) { x.entries++; if (s.views <= 1 && !s.events.length) x.bounces++ }
      if (i === s.pages.length - 1) x.exits++
      if (s.converted) x.conv++
    })
  }
  const pages = [...pg.values()].sort((a, b) => b.views - a.views).slice(0, 50).map((x) => ({ path: x.path, views: x.views, visitors: x.vis.size, avgDur: x.durN ? Math.round(x.dur / x.durN) : 0, entries: x.entries, exits: x.exits, exitRate: x.views ? +((x.exits / x.views) * 100).toFixed(1) : 0, bounce: x.entries ? +((x.bounces / x.entries) * 100).toFixed(1) : 0 }))

  // Kanal / kaynak / kampanya
  type Agg = { name: string; sessions: number; vis: Set<string>; conv: number; views: number; dur: number }
  const mk = (n: string): Agg => ({ name: n, sessions: 0, vis: new Set(), conv: 0, views: 0, dur: 0 })
  const add = (m: Map<string, Agg>, key: string, s: Sess) => { let a = m.get(key); if (!a) { a = mk(key); m.set(key, a) } a.sessions++; a.vis.add(s.uid ?? s.vid); a.views += s.views; a.dur += s.dur; if (s.converted) a.conv++ }
  const ch = new Map<string, Agg>(), src = new Map<string, Agg>(), cmp = new Map<string, Agg>(), trm = new Map<string, Agg>(), med = new Map<string, Agg>()
  for (const c of CHANNELS) ch.set(c, mk(c))
  for (const s of ss) {
    add(ch, s.channel, s)
    add(src, `${s.source}${s.medium ? ' / ' + s.medium : ''}`, s)
    if (s.campaign) add(cmp, `${s.campaign}||${s.source}||${s.medium ?? ''}`, s)
    if (s.term) add(trm, s.term, s)
    if (s.content) add(med, s.content, s)
  }
  const fin = (m: Map<string, Agg>, n = 30) => [...m.values()].sort((a, b) => b.sessions - a.sessions).slice(0, n).map((a) => ({ name: a.name, sessions: a.sessions, visitors: a.vis.size, conversions: a.conv, rate: a.sessions ? +((a.conv / a.sessions) * 100).toFixed(1) : 0, pagesPerSession: a.sessions ? +(a.views / a.sessions).toFixed(1) : 0, avgDur: a.sessions ? Math.round(a.dur / a.sessions) : 0 }))

  // Kitle
  const cn = new Map<string, number>(), ci = new Map<string, number>(), dv = new Map<string, number>(), br = new Map<string, number>(), os = new Map<string, number>(), lg = new Map<string, number>(), sc = new Map<string, number>()
  const seenV = new Set<string>()
  for (const s of ss) {
    const vk = s.uid ?? s.vid
    if (seenV.has(vk)) continue
    seenV.add(vk)
    inc(cn, s.country || '—'); if (s.city) inc(ci, `${s.city}|${s.country ?? ''}`); inc(dv, s.device); inc(br, s.browser || 'Bilinmiyor'); inc(os, s.os || 'Bilinmiyor'); inc(lg, s.lang || '—')
    const scr = s.rows.find((r) => r.meta?.screen)?.meta?.screen; if (scr) inc(sc, scr)
  }

  // Olaylar, bölümler, dönüşümler
  const ev = new Map<string, { total: number; vis: Set<string> }>()
  const secs = new Map<string, Set<string>>()
  for (const r of cur) {
    if (r.kind === 'event' && r.name) { const e = ev.get(r.name) ?? { total: 0, vis: new Set<string>() }; e.total++; e.vis.add(r.sid ?? r.vid); ev.set(r.name, e) }
    if (r.kind === 'section' && r.name) { const e = secs.get(r.name) ?? new Set<string>(); e.add(r.sid ?? r.vid); secs.set(r.name, e) }
  }
  const sinceMs = start.getTime()
  const requests = subs.filter((m) => new Date(m.created_at).getTime() >= sinceMs).length
  const prevRequests = subs.filter((m) => { const t = new Date(m.created_at).getTime(); return t < sinceMs && t >= sinceMs - days * 86400000 }).length

  // Ziyaretçi yolculukları (son 150 oturum)
  const journeys = [...ss].sort((a, b) => b.first.localeCompare(a.first)).slice(0, 150).map((s) => ({
    sid: s.sid.slice(0, 10), uid: s.uid ? s.uid.slice(0, 8) : null, first: s.first, country: s.country, city: s.city, device: s.device, browser: s.browser, os: s.os, lang: s.lang,
    channel: s.channel, source: s.source, campaign: s.campaign, referrer: s.referrer, entry: s.entry, exit: s.exit, views: s.views, dur: s.dur, converted: s.converted,
    returning: s.uid ? returningUid.has(s.uid) : false, visits: s.uid ? perUid.get(s.uid)?.length ?? 1 : 1,
    pages: s.pages.slice(0, 40), events: s.events,
  }))

  // Kalıcı ziyaretçi profilleri
  const profiles = [...perUid.entries()].map(([u, list]) => {
    const sorted = [...list].sort((a, b) => a.first.localeCompare(b.first))
    return {
      uid: u.slice(0, 8), sessions: list.length, views: list.reduce((a, s) => a + s.views, 0), first: sorted[0].first, last: sorted[sorted.length - 1].last,
      returning: returningUid.has(u), country: sorted[0].country, city: sorted[0].city, device: sorted[0].device, channel: sorted[0].channel,
      converted: list.some((s) => s.converted), pages: [...new Set(list.flatMap((s) => s.pages.map((p) => p.path)))].slice(0, 12),
      dur: list.reduce((a, s) => a + s.dur, 0),
    }
  }).sort((a, b) => b.sessions - a.sessions || b.views - a.views).slice(0, 100)

  // Tekrar sıklığı
  const freq = { one: 0, two: 0, three: 0, more: 0 }
  for (const list of perUid.values()) { const n = list.length; if (n === 1) freq.one++; else if (n === 2) freq.two++; else if (n === 3) freq.three++; else freq.more++ }

  // Süre dağılımı
  const buckets = [0, 0, 0, 0, 0]
  for (const s of ss) { const d = s.dur; buckets[d === 0 ? 0 : d < 10 ? 1 : d < 60 ? 2 : d < 180 ? 3 : 4]++ }

  // Sayfa akışı: en sık geçişler
  const flow = new Map<string, number>()
  for (const s of ss) for (let i = 0; i < s.pages.length - 1; i++) if (s.pages[i].path !== s.pages[i + 1].path) inc(flow, `${s.pages[i].path} → ${s.pages[i + 1].path}`)

  return {
    days, truncated: all.length >= MAX_ROWS, hasSessions: all.some((r) => r.sid),
    totals: { ...T, requests }, prev: { ...P, requests: prevRequests }, daily, hours, weekdays, heat,
    pages, entries: [...pages].sort((a, b) => b.entries - a.entries).slice(0, 10).map((p) => ({ path: p.path, n: p.entries, bounce: p.bounce })),
    exits: [...pages].sort((a, b) => b.exits - a.exits).slice(0, 10).map((p) => ({ path: p.path, n: p.exits, rate: p.exitRate })),
    channels: fin(ch), sources: fin(src), campaigns: fin(cmp), terms: fin(trm), contents: fin(med),
    countries: arr(cn, 'country', 15), cities: arr(ci, 'city', 15), devices: arr(dv, 'device'), browsers: arr(br, 'browser'), oses: arr(os, 'os'), langs: arr(lg, 'lang'), screens: arr(sc, 'screen', 8),
    events: [...ev.entries()].map(([name, v]) => ({ name, total: v.total, visitors: v.vis.size })).sort((a, b) => b.total - a.total),
    sections: [...secs.entries()].map(([name, v]) => ({ name, sessions: v.size })),
    audience: kitle, freq, durations: buckets, flow: arr(flow, 'path', 12), journeys, profiles,
  }
}

/** Son 60 dakika: şu an sitede olanlar ve hareket akışı. */
export async function buildRealtime() {
  const now = Date.now()
  const rows = await fetchViews(new Date(now - 60 * 60000).toISOString())
  const ss = sessionize(rows)
  const active = ss.filter((s) => now - new Date(s.last).getTime() < 5 * 60000)
  const mins = Array<number>(30).fill(0)
  for (const r of rows) {
    if (r.kind !== 'view') continue
    const m = Math.floor((now - new Date(r.ts).getTime()) / 60000)
    if (m >= 0 && m < 30) mins[29 - m]++
  }
  const pg = new Map<string, number>()
  for (const s of active) inc(pg, s.exit)
  const cn = new Map<string, number>()
  for (const s of active) inc(cn, s.country || '—')
  const feed = rows.filter((r) => r.kind === 'view' || r.kind === 'event').slice(0, 40).map((r) => ({ ts: r.ts, kind: r.kind, name: r.name, path: r.path, country: r.country, city: r.meta?.city, device: r.device, ref: r.referrer, title: r.meta?.title }))
  return {
    active: active.length, last30: new Set(ss.filter((s) => now - new Date(s.last).getTime() < 30 * 60000).map((s) => s.uid ?? s.vid)).size,
    views60: rows.filter((r) => r.kind === 'view').length, minutes: mins,
    pages: arr(pg, 'path', 8), countries: arr(cn, 'country', 8),
    now: active.slice(0, 20).map((s) => ({ country: s.country, city: s.city, device: s.device, channel: s.channel, source: s.source, path: s.exit, views: s.views, last: s.last })),
    feed,
  }
}
