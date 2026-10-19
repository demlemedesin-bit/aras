'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, useSite } from './SiteProvider';

export default function Preloader() {
  const { t } = useSite();
  const [state, setState] = useState<'on' | 'done' | 'gone'>('on');
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;
    let finished = false;
    const root = document.documentElement;
    const finish = () => {
      if (finished) return;
      finished = true;
      const fonts = document.fonts?.ready ?? Promise.resolve();
      Promise.race([fonts, new Promise((r) => setTimeout(r, 800))]).then(() => {
        setState('done');
        root.classList.remove('pre-lock');
        setTimeout(() => setState('gone'), 900);
      });
    };
    const t0 = performance.now();
    const dur = prefersReducedMotion() ? 150 : 1100;
    const step = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / dur));
      const e = 1 - Math.pow(1 - p, 2.2);
      if (bar.current) bar.current.style.transform = `scaleX(${e})`;
      if (p < 1) raf = requestAnimationFrame(step);
      else finish();
    };
    raf = requestAnimationFrame(step);
    const fallback = setTimeout(finish, 3500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, []);

  if (state === 'gone') return null;
  return (
    <div id="pre" className={state === 'done' ? 'done' : undefined} aria-hidden="true">
      <div className="pre__c">
        <span className="pre__logo">
          <img src="/images/logo.png" alt="" width={340} height={130} />
        </span>
        <p>{t('pre.t')}</p>
        <div className="pre__bar">
          <i ref={bar} />
        </div>
      </div>
    </div>
  );
}
