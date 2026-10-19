'use client';
import { useEffect } from 'react';
import { track } from '@/lib/track';

const SECTIONS = ['top', 'tarihce', 'hakkimizda', 'koleksiyonlar', 'urunler', 'galeri', 'showroom', 'surdurulebilirlik', 'haberler', 'iletisim'];

/** Sayfa görüntüleme, bölüm görüntüleme ve tıklama olayları. */
export default function Track() {
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Sayfa görüntüleme: aynı oturumda 30 dk içinde tekrar sayılmaz
    try {
      const key = 'aras-pv:' + location.pathname;
      const last = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - last >= 30 * 60 * 1000) {
        sessionStorage.setItem(key, String(Date.now()));
        timers.push(setTimeout(() => track('view'), 1200));
      }
    } catch {
      timers.push(setTimeout(() => track('view'), 1200));
    }

    // Bölüm görüntüleme: her bölüm sayfa başına bir kez
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || seen.has(e.target.id)) continue;
          seen.add(e.target.id);
          track('section', e.target.id);
        }
      },
      { threshold: 0.35 },
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    // Telefon, e-posta, WhatsApp, harita ve sosyal medya tıklamaları
    const onClick = (ev: MouseEvent) => {
      const a = (ev.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const h = a.getAttribute('href') || '';
      if (h.startsWith('tel:')) track('event', 'phone_click');
      else if (h.startsWith('mailto:')) track('event', 'mail_click');
      else if (/wa\.me|whatsapp\.com/i.test(h)) track('event', 'whatsapp_click');
      else if (/maps\.app\.goo\.gl|google\.[a-z.]+\/maps/i.test(h)) track('event', 'map_click');
      else if (/instagram\.com|facebook\.com|twitter\.com|x\.com|linkedin\.com/i.test(h)) track('event', 'social_click');
    };
    document.addEventListener('click', onClick, { capture: true });

    return () => {
      timers.forEach(clearTimeout);
      io.disconnect();
      document.removeEventListener('click', onClick, { capture: true });
    };
  }, []);
  return null;
}
