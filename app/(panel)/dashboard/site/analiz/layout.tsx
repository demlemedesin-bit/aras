'use client'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { ReportProvider, useReport } from '@panel/components/site/analytics-ui'

const TABS = [
  ['/dashboard/site/analiz', 'Özet'],
  ['/dashboard/site/analiz/canli', 'Canlı'],
  ['/dashboard/site/analiz/ziyaretciler', 'Ziyaretçiler'],
  ['/dashboard/site/analiz/sayfalar', 'Sayfalar'],
  ['/dashboard/site/analiz/kaynaklar', 'Kaynaklar'],
  ['/dashboard/site/analiz/kitle', 'Kitle'],
  ['/dashboard/site/analiz/donusumler', 'Dönüşümler'],
] as const

function Bar() {
  const path = usePathname()
  const { days, setDays, reload, loading } = useReport()
  const live = path.endsWith('/canli')
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
      <nav className="tabs" style={{ flex: 1, minWidth: 280, overflowX: 'auto', background: 'transparent' }}>
        {TABS.map(([h, l]) => <Link key={h} href={h} className={`tab${path === h ? ' active' : ''}`}>{l}</Link>)}
      </nav>
      {!live && (
        <>
          <div style={{ display: 'flex', gap: 6 }}>{[7, 14, 30, 90].map((p) => <button key={p} className={p === days ? 'btn' : 'btn-ghost'} onClick={() => setDays(p)}>{p} gün</button>)}</div>
          <button className="btn-ghost" onClick={reload} disabled={loading} aria-label="Yenile"><RefreshCw size={14} /></button>
        </>
      )}
    </div>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  return <ReportProvider><Bar />{children}</ReportProvider>
}
