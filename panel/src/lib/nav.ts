import {
  LayoutDashboard, Package, Layers, Images, Newspaper, Handshake, Inbox,
  Type, Megaphone, ClipboardList, FolderOpen, Building2, History, FileText, FolderTree, SlidersHorizontal, UserCog, BarChart3, Search,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = { href: string; label: string; Icon: LucideIcon; admin?: boolean; badge?: 'unread' }

export const NAV: { g: string; items: NavItem[] }[] = [
  { g: 'Genel', items: [
    { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/dashboard/site/mesajlar', label: 'Talepler & Mesajlar', Icon: Inbox, badge: 'unread' },
  ]},
  { g: 'Analiz', items: [
    { href: '/dashboard/site/analiz', label: 'Analitik', Icon: BarChart3 },
    { href: '/dashboard/site/reklam', label: 'Reklam & Kampanya', Icon: Megaphone },
    { href: '/dashboard/site/seo', label: 'SEO', Icon: Search },
    { href: '/dashboard/site/raporlar', label: 'Raporlar', Icon: ClipboardList },
  ]},
  { g: 'Katalog', items: [
    { href: '/dashboard/site/urunler', label: 'Ürünler', Icon: Package },
    { href: '/dashboard/site/kategoriler', label: 'Kategoriler', Icon: FolderTree },
    { href: '/dashboard/site/koleksiyonlar', label: 'Koleksiyonlar', Icon: Layers },
  ]},
  { g: 'Kurumsal', items: [
    { href: '/dashboard/site/tarihce', label: 'Tarihçe', Icon: History },
    { href: '/dashboard/site/haberler', label: 'Fuarlar ve ödüller', Icon: Newspaper },
    { href: '/dashboard/site/bayiler', label: 'Firmalar / Bayiler', Icon: Building2 },
    { href: '/dashboard/site/ortaklar', label: 'İş Ortakları', Icon: Handshake },
  ]},
  { g: 'Site', items: [
    { href: '/dashboard/site/metinler', label: 'Metinler (6 dil)', Icon: Type },
    { href: '/dashboard/site/sayfalar', label: 'Sayfalar (SSS, Gizlilik…)', Icon: FileText },
    { href: '/dashboard/site/medya', label: 'Medya Kütüphanesi', Icon: FolderOpen },
    { href: '/dashboard/site/ayarlar', label: 'Site Ayarları', Icon: SlidersHorizontal },
  ]},
  { g: 'Sistem', items: [
    { href: '/dashboard/kullanicilar', label: 'Kullanıcılar', Icon: UserCog, admin: true },
  ]},
]

export const ROLE_L: Record<string, string> = { admin: 'Yönetici', manager: 'Editör', member: 'Kısıtlı', muhasebe: 'Kısıtlı' }

export const isActive = (pathname: string, href: string) =>
  href === '/dashboard' ? pathname === href : pathname.startsWith(href)
