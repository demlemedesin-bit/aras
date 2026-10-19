import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aras Metal | Galvaniz ev, bahçe ve sofra ürünleri',
  description:
    "Aras Metal, 1951'den beri İstanbul'da galvaniz çelikten ev, bahçe ve sofra ürünleri üretiyor. Kullandığımız çelik %100 geri dönüştürülebilir.",
  openGraph: {
    title: 'Aras Metal | Home & Garden',
    description: 'Galvaniz çelikten ev, bahçe ve sofra ürünleri.',
    type: 'website',
  },
  other: { google: 'notranslate' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
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
      <body>{children}</body>
    </html>
  );
}
