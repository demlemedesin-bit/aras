import type { Names } from './categories';
import type { Lang } from './i18n';

/** ---------- Menü & footer bağlantıları ---------- */
export type LinkKind = 'section' | 'page' | 'url' | 'catalog' | 'login' | 'lang' | 'tour' | 'cats' | 'menu';
/** kind: tıklayınca ne olur. cats = kategori ağacından açılır menü (world: home|garden); menu = children ile açılır menü. */
export type Link = { id: string; key?: string; label?: Names; href: string; show: boolean; kind?: LinkKind; world?: 'home' | 'garden'; children?: Link[] };
export type NavCfg = { header: Link[]; dock: Link[]; footer: Link[]; v?: number };
export const ACTION_HREF: Partial<Record<LinkKind, string>> = { catalog: '#katalog', login: '#giris', lang: '#dil', tour: '#tur' };
export const kindOf = (l: Link): LinkKind =>
  l.kind ?? (l.href === '#katalog' ? 'catalog' : l.href === '#giris' ? 'login' : l.href === '#dil' ? 'lang' : l.href === '#tur' ? 'tour' : l.href.startsWith('#') ? 'section' : /^https?:/.test(l.href) ? 'url' : 'page');
export const KIND_NAMES: Record<LinkKind, string> = {
  section: 'Sayfada bir bölüme kaydır', page: 'Başka bir sayfayı aç', url: 'Dış siteyi yeni sekmede aç', catalog: 'Bayi giriş / katalog penceresini aç', login: 'Giriş penceresini aç',
  lang: 'Dil seçim penceresini aç', tour: 'Sanal turu başlat', cats: 'Kategori ağacından açılır menü', menu: 'Kendi alt bağlantılarımla açılır menü',
};
export const SECTION_IDS: [string, string][] = [['tarihce', 'Tarihçe'], ['koleksiyonlar', 'Koleksiyonlar'], ['urunler', 'Ürünler'], ['haberler', 'Fuarlar ve ödüller'], ['hakkimizda', 'Hakkımızda'], ['showroom', 'Showroom'], ['iletisim', 'İletişim'], ['top', 'Sayfa başı']];
export const PAGE_PATHS: [string, string][] = [['/', 'Ana sayfa'], ['/kariyer', 'Kariyer'], ['/sss', 'Sık sorulan sorular'], ['/gizlilik', 'Gizlilik'], ['/cerez-politikasi', 'Çerez politikası'], ['/kullanim-kosullari', 'Kullanım koşulları'], ['/bayi/urunler', 'Bayi kataloğu']];

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
DEFAULT_NAV.header.unshift({ id: 'home', key: 'tab.home', href: '#koleksiyonlar', show: true, kind: 'cats', world: 'home' }, { id: 'garden', key: 'tab.garden', href: '#koleksiyonlar', show: true, kind: 'cats', world: 'garden' });
DEFAULT_NAV.v = 2;

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
export type ColorKey = 'k' | 'w' | 'z' | 'z2' | 'ash' | 'gr' | 'gr2' | 'gl' | 'fg' | 'pb' | 'bt' | 'btt' | 'hd' | 'dk' | 'dkt';
export type Theme = {
  colors: Partial<Record<ColorKey, string>>;
  radius: 'pill' | 'soft' | 'sharp';
  font: string;
  headFont: string; // '' = gövde fontu ile aynı
  base: number;
  overrides?: Override[];
  layout?: LayoutCfg;
};
export type LayoutCfg = { order: string[]; hidden: string[] };
/** Ana sayfa bölümleri (id = sayfadaki <section id>). */
export const SECTION_DEFS: { id: string; n: string }[] = [
  { id: 'top', n: 'Ana görsel (Hero)' }, { id: 'tarihce', n: 'Tarihçe' }, { id: 'koleksiyonlar', n: 'Koleksiyonlar' }, { id: 'urunler', n: 'Ürünler' }, { id: 'haberler', n: 'Fuarlar ve ödüller' },
  { id: 'hakkimizda', n: 'Hakkımızda' }, { id: 'showroom', n: 'Showroom' }, { id: 'surdurulebilirlik', n: 'Çelik / sürdürülebilirlik' }, { id: 'iletisim', n: 'İletişim' },
];
export const DEFAULT_LAYOUT: LayoutCfg = { order: SECTION_DEFS.map((x) => x.id), hidden: [] };
/** Kayıtlı sırayı geçerli bölümlerle uzlaştırır (yeni bölümler sona eklenir). */
export function normLayout(l?: Partial<LayoutCfg> | null): LayoutCfg {
  const known = SECTION_DEFS.map((x) => x.id);
  const order = [...(l?.order ?? []).filter((id) => known.includes(id)), ...known.filter((id) => !(l?.order ?? []).includes(id))];
  return { order: [...new Set(order)], hidden: (l?.hidden ?? []).filter((id) => known.includes(id)) };
}
export type Override = { id: string; sel: string; note?: string; css: Record<string, string> };
export const THEME_DEFAULT: Theme = {
  colors: { k: '#000000', w: '#ffffff', z: '#eceeee', z2: '#d8dcdc', ash: '#4f5555', gr: '#299826', gr2: '#1e7a1c', gl: '#8dc47e', fg: '#10361a', pb: '#fafafa', bt: '#000000', btt: '#ffffff', hd: '#ffffff', dk: '#000000', dkt: '#ffffff' },
  radius: 'pill',
  font: 'Bricolage Grotesque',
  headFont: '',
  base: 17,
  overrides: [],
};
export const COLOR_GROUPS: { n: string; keys: { k: ColorKey; n: string; d: string }[] }[] = [
  { n: 'Genel', keys: [
    { k: 'w', n: 'Sayfa zemini', d: 'Sitenin ana arka planı' },
    { k: 'k', n: 'Ana metin', d: 'Başlıklar ve gövde yazısı' },
    { k: 'ash', n: 'Yardımcı metin', d: 'Açıklama ve alt yazılar' },
    { k: 'z', n: 'Açık gri zemin', d: 'Koleksiyon gibi vurgulu bölümler' },
    { k: 'z2', n: 'Çizgi ve kenarlık', d: 'Ayraç ve ince çizgiler' },
    { k: 'pb', n: 'Ürün zemini', d: 'Ürün görselinin arkası' },
  ] },
  { n: 'Vurgu', keys: [
    { k: 'gr', n: 'Vurgu rengi', d: 'Hover, işaretler, simgeler' },
    { k: 'gr2', n: 'Vurgu (koyu ton)', d: 'Üzerine gelince koyulaşan' },
    { k: 'gl', n: 'Vurgu (açık ton)', d: 'Koyu zemindeki odak çizgisi' },
    { k: 'fg', n: 'Koyu yeşil zemin', d: 'Garden kartı gibi koyu alanlar' },
  ] },
  { n: 'Düğmeler', keys: [
    { k: 'bt', n: 'Düğme zemini', d: 'Ana düğme ve seçili sekme' },
    { k: 'btt', n: 'Düğme yazısı', d: 'Düğmelerin içindeki yazı' },
  ] },
  { n: 'Üst menü', keys: [{ k: 'hd', n: 'Üst menü zemini', d: 'Üst çubuk, açılır menüler' }] },
  { n: 'Koyu bölümler', keys: [
    { k: 'dk', n: 'Koyu bölüm zemini', d: 'Footer, ürünler, çelik, iletişim, alt çubuk' },
    { k: 'dkt', n: 'Koyu bölüm yazısı', d: 'Bu bölümlerdeki yazı' },
  ] },
];
export const RADIUS_PX: Record<Theme['radius'], string> = { pill: '99px', soft: '14px', sharp: '2px' };
export const FONTS = ['Bricolage Grotesque', 'Inter', 'Manrope', 'Poppins', 'DM Sans', 'Montserrat', 'Work Sans', 'Playfair Display', 'Lora', 'Oswald', 'Barlow'];

const cv = (k: string) => (k === 'btt' ? '--bt-t' : k === 'dkt' ? '--dk-t' : `--${k}`);
const HEX = /^#[0-9a-fA-F]{6}$/;
export const HEAD_SEL = 'h1,h2,h3,h4,.h2,.h4,.row__n';
const q = (f: string) => `'${f}',system-ui,sans-serif`;

/** Tam stil (varsayılanlar dahil). Önizleme ve sunucu aynı çıktıyı kullanır. */
export function themeCssFull(th: Partial<Theme>): string {
  const t = { ...THEME_DEFAULT, ...th, colors: { ...THEME_DEFAULT.colors, ...(th.colors ?? {}) } };
  const v = Object.entries(t.colors).filter(([, c]) => typeof c === 'string' && HEX.test(c)).map(([k, c]) => `${cv(k)}:${c}`);
  v.push(`--rp:${RADIUS_PX[t.radius] ?? '99px'}`);
  const f = FONTS.includes(t.font) ? t.font : THEME_DEFAULT.font;
  let css = `:root:root{${v.join(';')}}html body{font-family:${q(f)};font-size:${Math.min(20, Math.max(14, t.base || 17))}px}`;
  if (t.headFont && FONTS.includes(t.headFont)) css += `html body :is(${HEAD_SEL}){font-family:${q(t.headFont)}}`;
  return css + overrideCss(t.overrides);
}
/** Öğe bazlı özel stiller. Seçici ve değerler sıkı doğrulanır (panel yazar, herkes okur). */
export const OVERRIDE_PROPS = ['color', 'background-color', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'padding', 'margin', 'border-radius', 'opacity', 'display', 'border-color', 'gap'] as const;
const SEL_OK = /^[\w\s.#>:\-\[\]="'(),+~*]{1,200}$/;
const VAL_OK = /^[#\w\s.,%()\-+/]{1,60}$/;
export function overrideCss(list?: Override[]): string {
  let out = '';
  for (const o of list ?? []) {
    if (!o || typeof o.sel !== 'string' || !SEL_OK.test(o.sel) || /[{};@\\]|url|expression|import/i.test(o.sel)) continue;
    const d = Object.entries(o.css ?? {}).filter(([k, v]) => (OVERRIDE_PROPS as readonly string[]).includes(k) && typeof v === 'string' && VAL_OK.test(v) && !/url|expression|import/i.test(v) && (k !== 'display' || v === 'none')).map(([k, v]) => `${k}:${v}!important`);
    if (d.length) out += `html body ${o.sel}{${d.join(';')}}`;
  }
  return out;
}
export function themeCss(th?: Partial<Theme> | null): string {
  if (!th || !Object.keys(th).length) return '';
  return themeCssFull(th);
}
const gf = (f: string) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`;
export function fontHref(th?: Partial<Theme> | null): string | null {
  const fs = [th?.font, th?.headFont].filter((f): f is string => !!f && f !== THEME_DEFAULT.font && FONTS.includes(f));
  return fs.length ? `https://fonts.googleapis.com/css2?${[...new Set(fs)].map(gf).join('&')}&display=swap` : null;
}

export const PRESETS: { n: string; t: Partial<Theme> }[] = [
  { n: 'Varsayılan (Aras yeşili)', t: { colors: {} } },
  { n: 'Okyanus', t: { colors: { gr: '#1f7ae0', gr2: '#175fb0', gl: '#8ec1f5', fg: '#0b2a4a', k: '#0b1b2b', bt: '#0b1b2b', dk: '#0b1b2b', z: '#e9f0f7', z2: '#d3dfeb', pb: '#f6f9fc' } } },
  { n: 'Bakır', t: { colors: { gr: '#b5651d', gr2: '#8f4f15', gl: '#e0b48a', fg: '#3a2410', k: '#1d1209', bt: '#1d1209', dk: '#1d1209', z: '#f3ece4', z2: '#e2d5c6', pb: '#fbf8f4' }, radius: 'soft' } },
  { n: 'Kırmızı metal', t: { colors: { gr: '#d3202c', gr2: '#a5161f', gl: '#f0868d', fg: '#3a0a0e', k: '#141414', bt: '#d3202c', btt: '#ffffff', dk: '#141414', z: '#f2f2f2', z2: '#dedede' }, radius: 'sharp' } },
  { n: 'Gece', t: { colors: { w: '#0f1412', k: '#f1f5f2', ash: '#9aa8a0', z: '#17201c', z2: '#25312b', pb: '#17201c', gr: '#4ad66d', gr2: '#37b755', gl: '#8dc47e', fg: '#0b2415', bt: '#4ad66d', btt: '#06140b', hd: '#0f1412', dk: '#070a09', dkt: '#f1f5f2' } } },
];
