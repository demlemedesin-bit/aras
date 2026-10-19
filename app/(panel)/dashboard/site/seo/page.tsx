'use client'
import { useState } from 'react'
import General from './General'
import PagesTab from './PagesTab'
import Keywords from './Keywords'
import Robots from './Robots'
import Tools from './Tools'

const TABS = [['genel', 'Genel ve teknik kontrol'], ['sayfalar', 'Sayfa bazlı SEO'], ['kelimeler', 'Anahtar kelimeler'], ['robots', 'Robots ve sitemap'], ['araclar', 'Araçlar']] as const

export default function Page() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('genel')
  return (
    <>
      <nav className="tabs" style={{ marginBottom: 16, overflowX: 'auto', background: 'transparent' }}>
        {TABS.map(([k, l]) => <button key={k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>)}
      </nav>
      {tab === 'genel' && <General />}
      {tab === 'sayfalar' && <PagesTab />}
      {tab === 'kelimeler' && <Keywords />}
      {tab === 'robots' && <Robots />}
      {tab === 'araclar' && <Tools />}
    </>
  )
}
