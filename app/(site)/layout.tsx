import type { Metadata, Viewport } from 'next';
import './globals.css';
import Track from '@/components/Track';
import { CONTACT } from '@/lib/data';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com';

type Meta = { google?: string; title?: string; desc?: string; og?: string; noindex?: boolean };

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
    const [seo, texts] = await Promise.all([get('site_settings?key=eq.seo&select=value'), get('site_texts?ns=eq.meta&key=in.(title,desc)&select=key,value')]);
    const tr = (k: string) => (texts as { key: string; value?: Record<string, string> }[]).find((t) => t.key === k)?.value?.tr?.trim() || undefined;
    const v = (seo as { value?: { google_verification?: string; og_image?: string; noindex?: boolean } }[])[0]?.value;
    return { google: v?.google_verification?.trim() || undefined, og: mediaUrl(v?.og_image?.trim()), noindex: v?.noindex === true, title: tr('title'), desc: tr('desc') };
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const m = await panelMeta();
  const title = m.title || 'Aras Metal | Galvaniz ev, bahçe ve sofra ürünleri';
  const description = m.desc || "Aras Metal, 1951'den beri İstanbul'da galvaniz çelikten ev, bahçe ve sofra ürünleri üretiyor. Kullandığımız çelik %100 geri dönüştürülebilir.";
  return {
    metadataBase: new URL(SITE),
    alternates: { canonical: '/' },
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Aras Metal',
      locale: 'tr_TR',
      url: '/',
      images: [{ url: m.og || '/images/hero-home.webp', alt: 'Aras Metal galvaniz ürünleri' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [m.og || '/images/hero-home.webp'] },
    ...(m.noindex ? { robots: { index: false, follow: false } } : {}),
    other: { google: 'notranslate' },
    ...(m.google ? { verification: { google: m.google } } : {}),
  };
}

export const viewport: Viewport = {
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
    },
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: 'Aras Metal', inLanguage: ['tr', 'en', 'de', 'fr', 'es', 'it'], publisher: { '@id': `${SITE}/#org` } },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js','pre-lock')" }} />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: '#pre{display:none!important}html.pre-lock{overflow:auto!important}' }} />
        </noscript>
        <link rel="preload" href="/fonts/bricolage-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Track />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </body>
    </html>
  );
}
