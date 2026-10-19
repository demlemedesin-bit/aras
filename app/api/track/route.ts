import { createHmac } from 'crypto'

export const runtime = 'nodejs'

// Çerezsiz, ham IP saklamayan ziyaret sayacı. Ziyaretçi kimliği günlük döner (IP+UA+gün → HMAC).
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|monitor|vercel|curl|wget|python|axios|node-fetch|go-http|java\//i
const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'it']
const EVENTS = ['dealer_register', 'dealer_login', 'product_click', 'collection_click', 'catalog_open', 'catalog_submit', 'contact_submit', 'tour_open', 'lang_change', 'phone_click', 'mail_click', 'whatsapp_click', 'map_click', 'social_click']
const SECTIONS = ['top', 'tarihce', 'hakkimizda', 'koleksiyonlar', 'urunler', 'galeri', 'showroom', 'surdurulebilirlik', 'haberler', 'iletisim']
const hits = new Map<string, number>()

const browserOf = (ua: string) => /edg\//i.test(ua) ? 'Edge' : /opr\/|opera/i.test(ua) ? 'Opera' : /samsungbrowser/i.test(ua) ? 'Samsung' : /yabrowser/i.test(ua) ? 'Yandex' : /firefox|fxios/i.test(ua) ? 'Firefox' : /chrome|crios/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : 'Diğer'
const osOf = (ua: string) => /windows/i.test(ua) ? 'Windows' : /android/i.test(ua) ? 'Android' : /iphone|ipad|ipod/i.test(ua) ? 'iOS' : /mac os/i.test(ua) ? 'macOS' : /linux|cros/i.test(ua) ? 'Linux' : 'Diğer'

export async function POST(req: Request) {
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL
  const ua = req.headers.get('user-agent') || ''
  if (!KEY || !URL_ || !ua || BOT.test(ua)) return new Response(null, { status: 204 })

  const body = await req.json().catch(() => ({}))
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  const day = new Date().toISOString().slice(0, 10)
  const vid = createHmac('sha256', KEY).update(`${ip}|${ua}|${day}`).digest('hex').slice(0, 24)

  // Basit hız sınırı: aynı ziyaretçiden saatte en çok 60 kayıt
  const hour = `${vid}:${new Date().getUTCHours()}`
  const n = (hits.get(hour) ?? 0) + 1
  hits.set(hour, n)
  if (hits.size > 5000) hits.clear()
  if (n > 60) return new Response(null, { status: 204 })

  const kind = body.kind === 'event' || body.kind === 'section' || body.kind === 'leave' ? body.kind : 'view'
  const name = kind === 'event' ? (EVENTS.includes(body.name) ? body.name : null) : kind === 'section' ? (SECTIONS.includes(body.name) ? body.name : null) : null
  if ((kind === 'event' || kind === 'section') && !name) return new Response(null, { status: 204 })

  const path = String(body.path || '/').split('?')[0].split('#')[0].slice(0, 200) || '/'
  const lang = LANGS.includes(body.lang) ? body.lang : null
  const country = (req.headers.get('x-vercel-ip-country') || '').slice(0, 2).toUpperCase() || null
  let referrer = ''
  try {
    const h = new URL(String(body.ref || '')).hostname.replace(/^www\./, '')
    const own = (req.headers.get('host') || '').replace(/^www\./, '')
    if (h && h !== own) referrer = h.slice(0, 120)
  } catch {}
  const device = /ipad|tablet/i.test(ua) ? 'tablet' : /mobi|android|iphone/i.test(ua) ? 'mobile' : 'desktop'

  const id = (v: unknown) => (typeof v === 'string' && /^[a-z0-9]{8,40}$/i.test(v) ? v : null)
  const str = (v: unknown, n: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : undefined)
  const u = (body.utm ?? {}) as Record<string, unknown>
  const dur = Number(body.dur)
  let city: string | undefined
  try { city = str(decodeURIComponent(req.headers.get('x-vercel-ip-city') || ''), 60) } catch {}
  const meta: Record<string, unknown> = {
    title: kind === 'view' ? str(body.title, 140) : undefined,
    screen: kind === 'view' && /^\d{3,5}x\d{3,5}$/.test(String(body.screen)) ? body.screen : undefined,
    s: str(u.s, 80), m: str(u.m, 80), c: str(u.c, 80), t: str(u.t, 80), n: str(u.n, 80), k: str(u.k, 12),
    city,
    browser: browserOf(ua),
    os: osOf(ua),
    entry: kind === 'view' && body.entry === true ? true : undefined,
    dur: kind === 'leave' && dur > 0 && dur < 7200 ? Math.round(dur) : undefined,
  }
  for (const k of Object.keys(meta)) if (meta[k] === undefined) delete meta[k]
  const sid = id(body.sid)
  const uid = id(body.uid)
  // Yalnızca ek sütunlar (sid/uid/meta) yoksa (migration henüz uygulanmadıysa) eski biçime düşer.
  const insert = (row: Record<string, unknown>) => fetch(`${URL_}/rest/v1/site_views`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  })

  try {
    const base = { kind: kind === 'leave' ? 'leave' : kind, name, path, lang, country, referrer, device, vid }
    const r = await insert({ ...base, sid, uid, meta })
    if (!r.ok && kind !== 'leave') await insert(base)
    // Eski kayıtları ara sıra temizle (yaklaşık her 500 istekte bir)
    if (Math.random() < 0.002) {
      await fetch(`${URL_}/rest/v1/rpc/site_views_cleanup`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: '{}' })
    }
  } catch {}
  return new Response(null, { status: 204 })
}
