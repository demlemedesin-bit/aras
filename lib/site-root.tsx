import type { Metadata, Viewport } from 'next';
import ThemeLive from '@/components/ThemeLive';
import Track from '@/components/Track';
import Consent from '@/components/Consent';
import Tags, { type AdsCfg } from '@/components/Tags';
import { CONTACT } from '@/lib/data';
import { themeCss, fontHref, type Theme } from '@/lib/site-config';
import { type Lang, CODES, metaFor, tr as trans } from '@/lib/i18n';
import { altLanguages, pathFor, OG_LOCALE } from '@/lib/lang-path';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com';

type Meta = { texts?: Record<string, Record<string, string> | undefined>; theme?: Partial<Theme>; google?: string; title?: string; desc?: string; og?: string; noindex?: boolean; ads?: AdsCfg };

const mediaUrl = (v?: string) => (!v ? undefined : v.startsWith('storage:') ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-media/${v.slice(8)}` : v);

/** Panelden girilen SEO başlığı/açıklaması (Türkçe) ve Google Search Console doğrulama kodu. */
async function panelMeta(): Promise<Meta> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return {};
  const get = async (q: string) => {
    const r = await fetch(`${url}/rest/v1/${q}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 300, tags: ['site-content'] } });
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  };
  try {
    const [seo, texts] = await Promise.all([get('site_settings?key=in.(seo,ads,theme)&select=key,value'), get('site_texts?ns=eq.meta&key=in.(title,desc)&select=key,value')]);
    const tx: Record<string, Record<string, string> | undefined> = {};
    for (const t of texts as { key: string; value?: Record<string, string> }[]) tx[t.key] = t.value;
    const rows = seo as { key: string; value?: any }[];
    const v = rows.find((x) => x.key === 'seo')?.value as { google_verification?: string; og_image?: string; noindex?: boolean } | undefined;
    const ads = rows.find((x) => x.key === 'ads')?.value as AdsCfg | undefined;
    return { theme: rows.find((x) => x.key === 'theme')?.value, google: v?.google_verification?.trim() || undefined, og: mediaUrl(v?.og_image?.trim()), noindex: v?.noindex === true, texts: tx, ads };
  } catch {
    return {};
  }
}

export async function siteMetadata(lang: Lang): Promise<Metadata> {
  const m = await panelMeta();
  const mf = metaFor(lang);
  const title = m.texts?.title?.[lang]?.trim() || (lang === 'tr' ? m.texts?.title?.tr?.trim() : '') || mf.title;
  const description = m.texts?.desc?.[lang]?.trim() || (lang === 'tr' ? m.texts?.desc?.tr?.trim() : '') || mf.desc;
  const here = pathFor(lang, '/');
  return {
    metadataBase: new URL(SITE),
    alternates: { canonical: here, languages: altLanguages('/') },
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Aras Metal',
      locale: OG_LOCALE[lang],
      alternateLocale: CODES.filter((c) => c !== lang).map((c) => OG_LOCALE[c]),
      url: here,
      images: [{ url: m.og || '/images/hero-home.webp', alt: 'Aras Metal galvaniz ürünleri' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [m.og || '/images/hero-home.webp'] },
    ...(m.noindex ? { robots: { index: false, follow: false } } : {}),
    applicationName: 'Aras Metal',
    category: 'business',
    keywords: ['galvaniz', 'galvaniz çelik', 'ev ürünleri', 'bahçe ürünleri', 'ekmek kutusu', 'çöp kovası', 'saksı', 'Aras Metal', 'toptan', 'ihracat'],
    formatDetection: { telephone: false },
    ...(m.noindex ? {} : { robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } } }),
    other: { google: 'notranslate' },
    ...(m.google ? { verification: { google: m.google } } : {}),
  };
}

export const siteViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#org`,
      name: 'Aras Metal',
      url: SITE,
      logo: `${SITE}/aras-logo.png`,
      foundingDate: '1951',
      description: "1951'den beri İstanbul'da galvaniz çelikten ev, bahçe ve sofra ürünleri üreten Aras Metal.",
      email: CONTACT.mail,
      telephone: CONTACT.tel,
      address: { '@type': 'PostalAddress', streetAddress: 'Adnan Kahveci, Harbiye Cd. No:19', postalCode: '34528', addressLocality: 'Beylikdüzü', addressRegion: 'İstanbul', addressCountry: 'TR' },
      sameAs: Object.values(CONTACT.social),
      contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', telephone: CONTACT.tel, email: CONTACT.mail, areaServed: 'Worldwide', availableLanguage: ['tr', 'en', 'de', 'fr', 'es', 'it'] }],
      knowsAbout: ['galvaniz çelik', 'ev ürünleri', 'bahçe ürünleri', 'sofra ürünleri'],
    },
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: 'Aras Metal', inLanguage: ['tr', 'en', 'de', 'fr', 'es', 'it'], publisher: { '@id': `${SITE}/#org` } },
  ],
};

export async function SiteRoot({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const pm = await panelMeta();
  const ads = pm.ads ?? {};
  const css = themeCss(pm.theme);
  const font = fontHref(pm.theme);
  return (
    <html lang={lang} translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js','pre-lock')" }} />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: '#pre{display:none!important}html.pre-lock{overflow:auto!important}' }} />
        </noscript>
        <link rel="preload" href="/fonts/bricolage-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {font && <link rel="stylesheet" href={font} />}
        {css && <style id="aras-theme" dangerouslySetInnerHTML={{ __html: css }} />}
      </head>
      <body>
        {children}
        <ThemeLive />
        <Track />
        <Consent />
        <Tags cfg={ads} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </body>
    </html>
  );
}
