'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export type LB = { photos: string[]; i: number; title?: string } | null;

export default function Lightbox({ lb, set }: { lb: LB; set: (v: LB) => void }) {
  useEffect(() => {
    if (!lb) return;
    const n = lb.photos.length;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') set(null);
      else if (e.key === 'ArrowRight') set({ ...lb, i: (lb.i + 1) % n });
      else if (e.key === 'ArrowLeft') set({ ...lb, i: (lb.i - 1 + n) % n });
    };
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [lb, set]);
  if (!lb || typeof document === 'undefined') return null;
  const n = lb.photos.length;
  const go = (d: number) => set({ ...lb, i: (lb.i + d + n) % n });
  return createPortal(
    <div className="lbx" role="dialog" aria-modal="true" aria-label={lb.title || 'Görsel'} onClick={() => set(null)}>
      <button className="lbx__x" aria-label="Kapat" onClick={() => set(null)}>×</button>
      {n > 1 && <button className="lbx__a lbx__a--l" aria-label="Önceki" onClick={(e) => { e.stopPropagation(); go(-1); }}>‹</button>}
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={lb.photos[lb.i]} alt={lb.title || ''} />
        {(lb.title || n > 1) && <figcaption>{lb.title}{n > 1 ? `  ${lb.i + 1} / ${n}` : ''}</figcaption>}
      </figure>
      {n > 1 && <button className="lbx__a lbx__a--r" aria-label="Sonraki" onClick={(e) => { e.stopPropagation(); go(1); }}>›</button>}
    </div>,
    document.body,
  );
}
