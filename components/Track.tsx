'use client';
import { useEffect } from 'react';

/** Çerezsiz ziyaret sayacı. Panelde oturumu açık personel sayılmaz. */
export default function Track() {
  useEffect(() => {
    try {
      if (navigator.webdriver || document.cookie.includes('-auth-token')) return;
      const key = 'aras-pv:' + location.pathname;
      const last = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - last < 30 * 60 * 1000) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch {}
    const t = setTimeout(() => {
      try {
        fetch('/api/track', {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: location.pathname, ref: document.referrer, lang: document.documentElement.lang }),
        }).catch(() => {});
      } catch {}
    }, 1200);
    return () => clearTimeout(t);
  }, []);
  return null;
}
