'use client';
import { useEffect } from 'react';
import { getConsent } from '@/lib/track';

export type AdsCfg = { ga4?: string; gtm?: string; meta?: string; gads?: string; gads_label?: string; clarity?: string };

// Yalnızca bilinen kimlik biçimleri kabul edilir (panelden girilen değer koda enjekte edilmez).
const OK: Record<keyof AdsCfg, RegExp> = {
  ga4: /^G-[A-Z0-9]{6,14}$/,
  gtm: /^GTM-[A-Z0-9]{4,10}$/,
  meta: /^\d{8,20}$/,
  gads: /^AW-\d{6,14}$/,
  gads_label: /^[A-Za-z0-9_-]{6,40}$/,
  clarity: /^[a-z0-9]{6,14}$/,
};
const val = (c: AdsCfg, k: keyof AdsCfg) => (c[k] && OK[k].test(c[k] as string) ? (c[k] as string) : '');

function script(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Reklam ve analitik etiketleri. Yalnızca ziyaretçi çerezleri kabul ettiyse ve personel oturumu yoksa yüklenir. */
export default function Tags({ cfg }: { cfg: AdsCfg }) {
  useEffect(() => {
    const w = window as unknown as Record<string, any>;
    const load = () => {
      if (w.__arasTags || getConsent() !== 'all' || navigator.webdriver || document.cookie.includes('-auth-token')) return;
      w.__arasTags = true;
      const ga4 = val(cfg, 'ga4'), gtm = val(cfg, 'gtm'), meta = val(cfg, 'meta'), gads = val(cfg, 'gads'), clarity = val(cfg, 'clarity');
      w.dataLayer = w.dataLayer || [];
      if (gtm) {
        w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
        script(`https://www.googletagmanager.com/gtm.js?id=${gtm}`);
      }
      if (ga4 || gads) {
        w.gtag = function () { w.dataLayer.push(arguments); };
        w.gtag('js', new Date());
        if (ga4) w.gtag('config', ga4, { anonymize_ip: true });
        if (gads) w.gtag('config', gads);
        script(`https://www.googletagmanager.com/gtag/js?id=${ga4 || gads}`);
      }
      if (gads) w.__arasAds = { gads, label: val(cfg, 'gads_label') };
      if (meta) {
        const n: any = (w.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); });
        if (!w._fbq) w._fbq = n;
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
        script('https://connect.facebook.net/en_US/fbevents.js');
        w.fbq('init', meta);
        w.fbq('track', 'PageView');
      }
      if (clarity) {
        w.clarity = w.clarity || function () { (w.clarity.q = w.clarity.q || []).push(arguments); };
        script(`https://www.clarity.ms/tag/${clarity}`);
      }
    };
    load();
    addEventListener('aras-consent', load);
    return () => removeEventListener('aras-consent', load);
  }, [cfg]);
  return null;
}
