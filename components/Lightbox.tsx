'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export type LBGroup = { name: string; photos: string[] };
export type LB = { groups: LBGroup[]; g: number; i: number; title?: string } | null;
export type LBCta = { label: string; on: () => void; note?: string };

export default function Lightbox({ lb, set, cta }: { lb: LB; set: (v: LB) => void; cta?: LBCta }) {
  useEffect(() => {
    if (!lb) return;
    const n = lb.groups[lb.g]?.photos.length || 1;
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
  const grp = lb.groups[lb.g];
  if (!grp) return null;
  const n = grp.photos.length;
  const go = (d: number) => set({ ...lb, i: (lb.i + d + n) % n });
  return createPortal(
    <div className="lbx" role="dialog" aria-modal="true" aria-label={lb.title || grp.name} onClick={() => set(null)}>
      <button className="lbx__x" aria-label="Kapat" onClick={() => set(null)}>×</button>
      <div className="lbx__box" onClick={(e) => e.stopPropagation()}>
        {lb.groups.length > 1 && (
          <div className="lbx__tabs" role="tablist">
            {lb.groups.map((x, k) => (
              <button key={x.name + k} role="tab" aria-selected={k === lb.g} className={k === lb.g ? 'on' : ''} onClick={() => set({ ...lb, g: k, i: 0 })}>{x.name}</button>
            ))}
          </div>
        )}
        <div className="lbx__stage">
          {n > 1 && <button className="lbx__a lbx__a--l" aria-label="Önceki" onClick={() => go(-1)}>‹</button>}
          <img src={grp.photos[lb.i]} alt={grp.name} />
          {n > 1 && <button className="lbx__a lbx__a--r" aria-label="Sonraki" onClick={() => go(1)}>›</button>}
        </div>
        {n > 1 && (
          <div className="lbx__th">
            {grp.photos.map((u, k) => (
              <button key={u} aria-label={`${grp.name} ${k + 1}`} className={k === lb.i ? 'on' : ''} style={{ backgroundImage: `url(${u})` }} onClick={() => set({ ...lb, i: k })} />
            ))}
          </div>
        )}
        <div className="lbx__foot">
          <span>{lb.title ? `${lb.title} · ` : ''}{grp.name}{n > 1 ? `  ${lb.i + 1} / ${n}` : ''}</span>
          {cta && (
            <button className="lbx__cta" onClick={() => { set(null); cta.on(); }}>{cta.label}</button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
