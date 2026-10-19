import {
  LayoutDashboard, Package, Layers, Images, Newspaper, Handshake, Inbox,
  Type, FolderOpen, Building2, SlidersHorizontal, UserCog, BarChart3, Search,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = { href: string; label: string; Icon: LucideIcon; admin?: boolean; badge?: 'unread' }

export const NAV: { g: string; items: NavItem[] }[] = [
  { g: 'Genel', items: [
    { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/dashboard/site/mesajlar', label: 'Talepler & Mesajlar', Icon: Inbox, badge: 'unread' },
  ]},
  { g: 'Analiz', items: [
    { href: '/dashboard/site/analiz', label: 'Ziyaretçi analizi', Icon: BarChart3 },
    { href: '/dashboard/site/seo', label: 'SEO', Icon: Search },
  ]},
  { g: 'Katalog', items: [
    { href: '/dashboard/site/urunler', label: 'Ürünler', Icon: Package },
    { href: '/dashboard/site/koleksiyonlar', label: 'Koleksiyonlar', Icon: Layers },
    { href: '/dashboard/site/galeri', label: 'Galeri', Icon: Images },
  ]},
  { g: 'Kurumsal', items: [
    { href: '/dashboard/site/haberler', label: 'Haberler', Icon: Newspaper },
    { href: '/dashboard/site/bayiler', label: 'Firmalar / Bayiler', Icon: Building2 },
    { href: '/dashboard/site/ortaklar', label: 'İş Ortakları', Icon: Handshake },
  ]},
  { g: 'Site', items: [
    { href: '/dashboard/site/metinler', label: 'Metinler (6 dil)', Icon: Type },
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
