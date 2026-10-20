import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { langForCountry } from '@/lib/geo-lang'

const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'it']
const PUBLIC = ['/', '/sss', '/kariyer', '/gizlilik', '/cerez-politikasi', '/kullanim-kosullari']
const BOT = /bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|facebookexternalhit|whatsapp|telegram|linkedin|twitter|preview|lighthouse|headless/i

// Panel yalnızca admin ve manager (editör) rolleri içindir.
// Kullanıcı yönetimi yalnızca admin.
const ADMIN_ONLY = ['/dashboard/kullanicilar']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bölgesel dil: ilk girişte ziyaretçinin ülkesine göre /en, /de … adresine yönlendirilir.
  // Kayıtlı dil tercihi (çerez) ülkeden önce gelir; arama botları yönlendirilmez.
  if (PUBLIC.includes(pathname)) {
    if (BOT.test(request.headers.get('user-agent') || '')) return NextResponse.next()
    const saved = request.cookies.get('aras-lang')?.value
    let pref: string | null = saved && LANGS.includes(saved) ? saved : null
    if (!pref) {
      pref = langForCountry(request.headers.get('x-vercel-ip-country'))
      if (!pref) {
        const al = (request.headers.get('accept-language') || '').split(',').map((x) => x.trim().slice(0, 2).toLowerCase())
        pref = al.find((x) => LANGS.includes(x)) ?? 'en'
      }
    }
    if (pref && pref !== 'tr') {
      const url = request.nextUrl.clone()
      url.pathname = pathname === '/' ? `/${pref}` : `/${pref}${pathname}`
      const res = NextResponse.redirect(url, 307)
      res.headers.set('Vary', 'Accept-Language, Cookie')
      return res
    }
    return NextResponse.next()
  }

  const mk = (response?: NextResponse) =>
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: any[]) {
            if (!response) return
            cookiesToSet.forEach(({ name, value, options }: any) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

  if (pathname === '/login') {
    try {
      const supabase = mk()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'admin' || profile?.role === 'manager') return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {}
    return NextResponse.next()
  }

  const response = NextResponse.next({ request: { headers: request.headers } })

  try {
    const supabase = mk(response)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role

    if (role !== 'admin' && role !== 'manager') {
      return NextResponse.redirect(new URL('/login?e=yetki', request.url))
    }
    if (role !== 'admin' && ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch {}

  return response
}

export const config = {
  matcher: ['/login', '/dashboard/:path*', '/', '/sss', '/kariyer', '/gizlilik', '/cerez-politikasi', '/kullanim-kosullari'],
}
