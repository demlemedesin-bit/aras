import type { Names } from './categories';
import type { Lang } from './i18n';

/** ---------- Menü & footer bağlantıları ---------- */
export type Link = { id: string; key?: string; label?: Names; href: string; show: boolean };
export type NavCfg = { header: Link[]; dock: Link[]; footer: Link[] };

const L = (id: string, key: string, href: string): Link => ({ id, key, href, show: true });
export const DEFAULT_NAV: NavCfg = {
  header: [L('tarihce', 'nav.hist', '#tarihce'), L('urunler', 'nav.prod', '#urunler'), L('iletisim', 'nav.contact', '#iletisim')],
  dock: [
    L('tarihce', 'nav.hist', '#tarihce'), L('koleksiyonlar', 'nav.col', '#koleksiyonlar'), L('urunler', 'nav.prod', '#urunler'), L('haberler', 'nav.fair', '#haberler'),
    L('hakkimizda', 'nav.about', '#hakkimizda'), L('showroom', 'nav.sr', '#showroom'), L('iletisim', 'nav.contact', '#iletisim'),
  ],
  footer: [
    L('about', 'nav.about', '/#hakkimizda'), L('hist', 'nav.hist', '/#tarihce'), L('sr', 'nav.sr', '/#showroom'), L('fair', 'nav.fair', '/#haberler'),
    L('car', 'ft.car', '/kariyer'), L('faq', 'ft.faq', '/sss'), L('priv', 'ft.priv', '/gizlilik'), L('cookie', 'ft.cookie', '/cerez-politikasi'),
    L('terms', 'ft.terms', '/kullanim-kosullari'), L('cat', 'cta.cat', '#katalog'),
  ],
};
// header: koleksiyonlar menüsü (Home/Garden) ayrı çizilir; bu liste ek bağlantılardır.
DEFAULT_NAV.header.splice(1, 0, L('koleksiyonlar', 'nav.col', '#koleksiyonlar'));

export const linkText = (l: Link, lang: Lang, t: (k: string) => string) => (l.label?.[lang]?.trim() || l.label?.tr?.trim() || (l.key ? t(l.key) : l.href));

/** ---------- Kariyer ---------- */
export type Position = { id: string; title: Names; place: Names; type: Names; desc: Names; active: boolean };
export type CareerCfg = {
  positions: Position[];
  phone: { show: boolean; required: boolean };
  message: { required: boolean };
  labels: Partial<Record<'name' | 'email' | 'phone' | 'msg' | 'send' | 'position' | 'open', Names>>;
  extra: { id: string; label: Names; required: boolean }[];
};
export const DEFAULT_CAREERS: CareerCfg = { positions: [], phone: { show: true, required: false }, message: { required: true }, labels: {}, extra: [] };

/** ---------- Tasarım ---------- */
export type Theme = {
  colors: Partial<Record<'k' | 'w' | 'z' | 'z2' | 'ash' | 'gr' | 'gr2' | 'gl' | 'fg' | 'pb', string>>;
  radius: 'pill' | 'soft' | 'sharp';
  font: string;
  base: number;
};
export const THEME_DEFAULT: Theme = {
  colors: { k: '#000000', w: '#ffffff', z: '#eceeee', z2: '#d8dcdc', ash: '#4f5555', gr: '#299826', gr2: '#1e7a1c', gl: '#8dc47e', fg: '#10361a', pb: '#fafafa' },
  radius: 'pill',
  font: 'Bricolage Grotesque',
  base: 17,
};
export const COLOR_LABELS: Record<keyof Theme['colors'], string> = {
  k: 'Ana metin / koyu düğmeler', w: 'Sayfa zemini / beyaz', z: 'Açık gri zemin', z2: 'Çizgi ve kenarlıklar', ash: 'Yardımcı metin',
  gr: 'Vurgu rengi', gr2: 'Vurgu (koyu ton)', gl: 'Vurgu (açık ton)', fg: 'Koyu yeşil zemin', pb: 'Ürün zemini',
};
export const RADIUS_PX: Record<Theme['radius'], string> = { pill: '99px', soft: '14px', sharp: '2px' };
export const FONTS = ['Bricolage Grotesque', 'Inter', 'Manrope', 'Poppins', 'DM Sans', 'Montserrat', 'Work Sans', 'Playfair Display', 'Lora'];

const HEX = /^#[0-9a-fA-F]{6}$/;
export function themeCss(th?: Partial<Theme> | null): string {
  if (!th) return '';
  const out: string[] = [];
  for (const [k, v] of Object.entries(th.colors ?? {})) if (typeof v === 'string' && HEX.test(v) && v.toLowerCase() !== (THEME_DEFAULT.colors as Record<string, string>)[k]) out.push(`--${k}:${v}`);
  if (th.radius && th.radius !== 'pill' && th.radius in RADIUS_PX) out.push(`--rp:${RADIUS_PX[th.radius]}`);
  const body: string[] = [];
  if (th.font && th.font !== THEME_DEFAULT.font && FONTS.includes(th.font)) body.push(`font-family:'${th.font}',system-ui,sans-serif`);
  if (th.base && th.base !== 17 && th.base >= 14 && th.base <= 20) body.push(`font-size:${th.base}px`);
  return (out.length ? `:root:root{${out.join(';')}}` : '') + (body.length ? `html body{${body.join(';')}}` : '');
}
export const fontHref = (th?: Partial<Theme> | null) =>
  th?.font && th.font !== THEME_DEFAULT.font && FONTS.includes(th.font) ? `https://fonts.googleapis.com/css2?family=${th.font.replace(/ /g, '+')}:wght@400;500;600;700&display=swap` : null;
