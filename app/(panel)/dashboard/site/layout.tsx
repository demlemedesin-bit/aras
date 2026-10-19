'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import TopBar from '@panel/components/TopBar'
import { ToastProvider, api } from '@panel/components/site/ui'

const NAV = [
  ['', 'Genel bakış'], ['metinler', 'Metinler'], ['koleksiyonlar', 'Koleksiyonlar'], ['urunler', 'Ürünler'], ['galeri', 'Galeri'],
  ['haberler', 'Haberler'], ['ortaklar', 'İş ortakları'], ['medya', 'Medya'], ['ayarlar', 'Ayarlar'], ['mesajlar', 'Mesajlar'],
] as const

export default function SiteLayout({ children }: { children: ReactNode }) {
  const path = usePathname()
  const [msg, setMsg] = useState('')
  async function refresh() {
    setMsg('…')
    try { const j = await api('POST', '/api/site', { action: 'revalidate' }); setMsg(j.revalidated ? 'Site güncellendi' : 'Site adresi/anahtarı tanımlı değil: site 5 dk içinde yenilenir') } catch (e: any) { setMsg(e.message) }
    setTimeout(() => setMsg(''), 4500)
  }
  return (
    <ToastProvider>
      <TopBar title="Site Yönetimi" subtitle="arasmetal.com" action={<>
        {msg && <small style={{ color: 'var(--tx3)' }}>{msg}</small>}
        <button className="btn-ghost" onClick={refresh}>Siteyi yenile</button>
        <a className="btn" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com'} target="_blank" rel="noopener">Siteyi aç ↗</a>
      </>} />
      <div style={{ padding: '14px 20px 40px', overflow: 'auto' }}>
        <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 18, borderBottom: '1px solid var(--bdr)', paddingBottom: 10 }}>
          {NAV.map(([slug, label]) => {
            const href = `/dashboard/site${slug ? '/' + slug : ''}`
            const on = slug ? path.startsWith(href) : path === href
            return <Link key={slug} href={href} className={on ? 'btn' : 'btn-ghost'} style={on ? { boxShadow: 'none' } : undefined}>{label}</Link>
          })}
        </nav>
        {children}
      </div>
    </ToastProvider>
  )
}
