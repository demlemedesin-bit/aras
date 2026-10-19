import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Panel yalnızca admin ve manager (editör) rolleri içindir.
// Kullanıcı yönetimi yalnızca admin.
const ADMIN_ONLY = ['/dashboard/kullanicilar']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  matcher: ['/login', '/dashboard/:path*'],
}
