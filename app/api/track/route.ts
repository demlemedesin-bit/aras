import { createHmac } from 'crypto'

export const runtime = 'nodejs'

// Çerezsiz, ham IP saklamayan ziyaret sayacı. Ziyaretçi kimliği günlük döner (IP+UA+gün → HMAC).
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|monitor|vercel|curl|wget|python|axios|node-fetch|go-http|java\//i
const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'it']
const EVENTS = ['catalog_open', 'catalog_submit', 'contact_submit', 'tour_open', 'lang_change', 'phone_click', 'mail_click', 'whatsapp_click', 'map_click', 'social_click']
const SECTIONS = ['top', 'hakkimizda', 'koleksiyonlar', 'urunler', 'galeri', 'showroom', 'surdurulebilirlik', 'haberler', 'iletisim']
const hits = new Map<string, number>()

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

  const kind = body.kind === 'event' || body.kind === 'section' ? body.kind : 'view'
  const name = kind === 'event' ? (EVENTS.includes(body.name) ? body.name : null) : kind === 'section' ? (SECTIONS.includes(body.name) ? body.name : null) : null
  if (kind !== 'view' && !name) return new Response(null, { status: 204 })

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

  try {
    await fetch(`${URL_}/rest/v1/site_views`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ kind, name, path, lang, country, referrer, device, vid }),
    })
    // Eski kayıtları ara sıra temizle (yaklaşık her 500 istekte bir)
    if (Math.random() < 0.002) {
      await fetch(`${URL_}/rest/v1/rpc/site_views_cleanup`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: '{}' })
    }
  } catch {}
  return new Response(null, { status: 204 })
}
