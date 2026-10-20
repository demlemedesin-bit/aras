'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@panel/lib/supabase/client'
import { useEffect, useState } from 'react'
import ArasLogo from './ArasLogo'
import { LogOut, ExternalLink } from 'lucide-react'
import { NAV, ROLE_L, isActive } from '@panel/lib/nav'

export function useMe() {
  const [me, setMe] = useState({ name: '', init: '?', role: 'manager', unread: 0, dealers: 0, quotes: 0 })
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      sb.from('profiles').select('full_name,role').eq('id', user.id).single().then(({ data }) => {
        const n = data?.full_name || user.email?.split('@')[0] || ''
        setMe((m) => ({ ...m, name: n, init: n.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '?', role: data?.role || 'manager' }))
      })
    })
    let last = -1
    const poll = () => fetch('/api/site?unread=1').then((r) => r.json()).then((j) => {
      const u = Number(j.unread) || 0, d = Number(j.dealers) || 0, q = Number(j.quotes) || 0
      setMe((m) => ({ ...m, unread: u, dealers: d, quotes: q }))
      const tot = u + d + q
      if (last >= 0 && tot > last && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try { new Notification('Aras Metal', { body: d > 0 ? `${d} bayi başvurusu onay bekliyor` : q > 0 ? `${q} yeni teklif talebi` : 'Yeni mesaj var' }) } catch { /* bildirim desteklenmiyor */ }
      }
      last = tot
    }).catch(() => {})
    poll()
    const iv = setInterval(poll, 60000)
    return () => clearInterval(iv)
  }, [])
  return me
}

export default function Sidebar() {
  const pathname = usePathname()
  const { name, init, role, unread, dealers, quotes } = useMe()
  const cnt = { unread, dealers, quotes }
  const nav = NAV.map((s) => ({ ...s, items: s.items.filter((i) => !i.admin || role === 'admin') })).filter((s) => s.items.length)
  async function logout() { await createClient().auth.signOut(); window.location.href = '/login' }

  return (
    <aside className="sb">
      <div className="sb-logo">
        <ArasLogo size={34} />
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--tx)', letterSpacing: '-.2px', lineHeight: 1.2 }}>Aras Metal</p>
          <p style={{ fontSize: 9.5, color: 'var(--tx3)', marginTop: 2 }}>Site Yönetimi</p>
        </div>
      </div>
      <nav className="sb-nav">
        {nav.map((sec) => (
          <div key={sec.g}>
            <p className="sb-group">{sec.g}</p>
            {sec.items.map(({ href, label, Icon, badge }) => (
              <Link key={href} href={href} className={`sb-item ${isActive(pathname, href) ? 'active' : ''}`}>
                <span className="sb-icon"><Icon size={14} strokeWidth={1.8} /></span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge && cnt[badge] > 0 && (
                  <span style={{ background: 'var(--ac)', color: '#fff', fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{cnt[badge]}</span>
                )}
              </Link>
            ))}
          </div>
        ))}
        <NotifyBtn />
        <p className="sb-group">Bağlantılar</p>
        <a className="sb-item" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com'} target="_blank" rel="noopener">
          <span className="sb-icon"><ExternalLink size={14} strokeWidth={1.8} /></span>
          <span style={{ flex: 1 }}>Siteyi aç</span>
        </a>
      </nav>
      <div className="sb-user" onClick={logout}>
        <div className="sb-av">{init}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || '...'}</p>
          <p style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 1 }}>{ROLE_L[role] || role} · Çıkış</p>
        </div>
        <LogOut size={13} style={{ color: 'var(--tx3)', flexShrink: 0 }} strokeWidth={1.8} />
      </div>
    </aside>
  )
}

function NotifyBtn() {
  const [p, setP] = useState<string>('granted')
  useEffect(() => { setP(typeof Notification === 'undefined' ? 'granted' : Notification.permission) }, [])
  if (p !== 'default') return null
  return (
    <button className="sb-item" style={{ width: '100%', background: 'none', border: 0, cursor: 'pointer', color: 'inherit' }} onClick={() => Notification.requestPermission().then(setP)}>
      <span className="sb-icon">🔔</span><span style={{ flex: 1, textAlign: 'left' }}>Tarayıcı bildirimlerini aç</span>
    </button>
  )
}
