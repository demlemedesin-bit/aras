import data from './i18n-data.json';

export type Lang = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
export type Dict = Record<string, string>;

export const LANGS = data.langs as unknown as { c: Lang; n: string; e: string; tag: string }[];
export const CODES: Lang[] = LANGS.map((l) => l.c);

const T = data.t as unknown as Record<Lang, Dict>;
const UI = data.ui as unknown as Record<Lang, Dict>;
const AUTH = data.auth as unknown as Record<Lang, Dict>;
const META = data.meta as unknown as Partial<Record<Lang, { title: string; desc: string }>>;

export const META_TR = {
  title: 'Aras Metal | Galvaniz ev, bahçe ve sofra ürünleri',
  desc: "Aras Metal, 1951'den beri İstanbul'da galvaniz çelikten ev, bahçe ve sofra ürünleri üretiyor. Kullandığımız çelik %100 geri dönüştürülebilir.",
};

/** Site metni: seçili dilde yoksa Türkçe'ye düşer. */
export const tr = (lang: Lang, key: string): string => T[lang]?.[key] ?? T.tr[key] ?? key;
/** Arayüz etiketleri (aria-label, form konuları, dil paneli). */
export const ui = (lang: Lang, key: string): string => (UI[lang] ?? UI.tr)[key];
/** Bayi girişi penceresi metinleri. */
export const authText = (lang: Lang): Dict => AUTH[lang] ?? AUTH.tr;
export const metaFor = (lang: Lang) => (lang === 'tr' ? META_TR : META[lang] ?? META_TR);
