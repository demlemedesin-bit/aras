'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@panel/lib/supabase/client'
import { useEffect, useState } from 'react'
import ArasLogo from './ArasLogo'
import { LogOut, Menu, X } from 'lucide-react'
import { NAV, ROLE_L, isActive } from '@panel/lib/nav'
import { useMe } from './Sidebar'

export default function MobileMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { name, init, role, unread, dealers, quotes } = useMe()
  const cnt = { unread, dealers, quotes }

  useEffect(() => { setOpen(false) }, [pathname])

  async function logout() { await createClient().auth.signOut(); window.location.href = '/login' }

  const filteredNav = NAV.map((s) => ({ ...s, items: s.items.filter((i) => !i.admin || role === 'admin') })).filter((s) => s.items.length)

  return (
    <>
      <style>{`
        .mm-trigger{position:fixed;top:10px;left:10px;z-index:9998;width:36px;height:36px;border-radius:10px;background:var(--s1);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;box-shadow:0 2px 12px rgba(0,0,0,.4)}
        .mm-trigger:hover{background:var(--s2)}
        .mm-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9998;backdrop-filter:blur(4px);animation:mmFadeIn .2s ease both}
        .mm-drawer{position:fixed;top:0;left:0;bottom:0;width:260px;background:var(--s1);border-right:1px solid var(--bdr);z-index:9999;display:flex;flex-direction:column;overflow:hidden;animation:mmSlideIn .22s cubic-bezier(.22,1,.36,1) both}
        @keyframes mmFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes mmSlideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        .mm-logo{padding:14px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        .mm-close{width:28px;height:28px;border-radius:8px;background:var(--s2);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--tx3)}
        .mm-nav{flex:1;overflow-y:auto;padding:6px 8px 10px}
        .mm-nav::-webkit-scrollbar{width:0}
        .mm-group{font-size:9.5px;font-weight:700;letter-spacing:.09em;color:var(--tx3);text-transform:uppercase;padding:10px 8px 4px}
        .mm-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;font-size:13px;color:var(--tx2);text-decoration:none;margin:1px 0;transition:background .1s,color .1s;border-left:2.5px solid transparent}
        .mm-item:hover:not(.active){color:var(--tx);background:var(--s2)}
        .mm-item.active{color:var(--tx);background:var(--ac2);font-weight:600;border-left-color:var(--ac)}
        .mm-item.active .mm-icon{color:var(--ac)}
        .mm-icon{flex-shrink:0;color:var(--tx3)}
        .mm-user{padding:10px 12px;border-top:1px solid var(--bdr);display:flex;align-items:center;gap:9px;cursor:pointer;flex-shrink:0;transition:background .1s}
        .mm-user:hover{background:var(--s2)}
        .mm-av{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--ac),#1e7a1c);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0}
      `}</style>

      <button className="mm-trigger" onClick={() => setOpen(true)}>
        <Menu size={16} color="var(--tx2)" strokeWidth={2} />
      </button>

      {open && <div className="mm-backdrop" onClick={() => setOpen(false)} />}

      {open && (
        <div className="mm-drawer">
          <div className="mm-logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <ArasLogo size={28} />
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--tx)', lineHeight: 1.2 }}>Aras Metal</p>
                <p style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1 }}>{ROLE_L[role]}</p>
              </div>
            </div>
            <div className="mm-close" onClick={() => setOpen(false)}><X size={13} strokeWidth={2} /></div>
          </div>
          <nav className="mm-nav">
            {filteredNav.map(sec => (
              <div key={sec.g}>
                <p className="mm-group">{sec.g}</p>
                {sec.items.map(({ href, label, Icon, badge }) => (
                  <Link key={href} href={href} className={`mm-item${isActive(pathname, href) ? ' active' : ''}`}>
                    <span className="mm-icon"><Icon size={14} strokeWidth={1.8} /></span>
                    <span style={{ flex: 1 }}>{label}</span>
                    {badge && cnt[badge] > 0 && <span style={{ background: 'var(--ac)', color: '#fff', fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{cnt[badge]}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="mm-user" onClick={logout}>
            <div className="mm-av">{init}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || '...'}</p>
              <p style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 1 }}>{ROLE_L[role]}</p>
            </div>
            <LogOut size={12} style={{ color: 'var(--tx3)', flexShrink: 0 }} strokeWidth={1.8} />
          </div>
        </div>
      )}
    </>
  )
}
