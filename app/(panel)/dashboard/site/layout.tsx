'use client'
import { useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import TopBar from '@panel/components/TopBar'
import { ToastProvider, api } from '@panel/components/site/ui'
import { NAV } from '@panel/lib/nav'

const TITLES: Record<string, string> = Object.fromEntries(NAV.flatMap((s) => s.items.map((i) => [i.href, i.label])))

export default function SiteLayout({ children }: { children: ReactNode }) {
  const path = usePathname()
  const [msg, setMsg] = useState('')
  const title = TITLES[Object.keys(TITLES).filter((h) => path.startsWith(h)).sort((a, b) => b.length - a.length)[0]] || 'Site Yönetimi'
  async function refresh() {
    setMsg('…')
    try { const j = await api('POST', '/api/site', { action: 'revalidate' }); setMsg(j.revalidated ? 'Site güncellendi' : 'Site 5 dk içinde yenilenir') } catch (e: any) { setMsg(e.message) }
    setTimeout(() => setMsg(''), 4500)
  }
  return (
    <ToastProvider>
      <TopBar title={title} subtitle="arasmetal.com" action={<>
        {msg && <small style={{ color: 'var(--tx3)' }}>{msg}</small>}
        <button className="btn-ghost" onClick={refresh}>Siteyi yenile</button>
        <a className="btn" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com'} target="_blank" rel="noopener">Siteyi aç ↗</a>
      </>} />
      <div style={{ padding: '18px 20px 40px', overflow: 'auto' }}>{children}</div>
    </ToastProvider>
  )
}
