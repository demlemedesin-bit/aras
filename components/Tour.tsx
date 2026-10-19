'use client';

import { useEffect, useRef } from 'react';
import { createTour } from '@/lib/tour-engine';
import { prefersReducedMotion, useSite } from './SiteProvider';
import { Icon } from './Icon';

const PTS = [0, 0.1249, 0.3411, 0.5608, 0.7777];
const ASPECT = 19.4683;

type Engine = ReturnType<typeof createTour>;

export default function Tour() {
  const { tourOpen, closeTour, t } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const autoBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const engine = useRef<Engine | null>(null);
  const open = useRef(tourOpen);
  open.current = tourOpen;
  const closeRef = useRef(closeTour);
  closeRef.current = closeTour;

  useEffect(() => {
    if (!view.current || !track.current || !counter.current || !hint.current || !autoBtn.current) return;
    engine.current = createTour({
      view: view.current,
      track: track.current,
      counter: counter.current,
      hint: hint.current,
      autoBtn: autoBtn.current,
      pts: PTS,
      asp: ASPECT,
      reduce: prefersReducedMotion(),
      isOpen: () => open.current,
      close: () => closeRef.current(),
    });
    return () => engine.current?.destroy();
  }, []);

  useEffect(() => {
    if (!tourOpen) return;
    engine.current?.start();
    closeBtn.current?.focus();
  }, [tourOpen]);

  const fullscreen = () => {
    const el = root.current;
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else el?.requestFullscreen?.();
    } catch {
      /* tam ekran desteklenmiyor */
    }
  };

  return (
    <div className={`tour${tourOpen ? ' open' : ''}`} ref={root} role="dialog" aria-modal="true" aria-label="Showroom" aria-hidden={!tourOpen}>
      <div className="tour__v" ref={view}>
        <div className="tour__t" ref={track}>
          <img src="/images/tour.webp" alt="" draggable={false} />
          <img src="/images/tour.webp" alt="" draggable={false} />
        </div>
      </div>
      <div className="tour__top">
        <p className="tour__hint" ref={hint}>{t('sr.drag')}</p>
        <button className="round round--w" ref={closeBtn} type="button" aria-label="Kapat" onClick={closeTour}>
          <Icon n="x" />
        </button>
      </div>
      <div className="tour__bar" role="toolbar">
        <button type="button" aria-label="Önceki nokta" onClick={() => engine.current?.go(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span className="tour__c" ref={counter}>1 / 5</span>
        <button type="button" aria-label="Sonraki nokta" onClick={() => engine.current?.go(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <i />
        <button type="button" aria-label="Uzaklaştır" onClick={() => engine.current?.zoom(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <button type="button" aria-label="Yakınlaştır" onClick={() => engine.current?.zoom(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <button type="button" aria-label="Sıfırla" onClick={() => engine.current?.resetView()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <i />
        <button type="button" ref={autoBtn} aria-label="Otomatik dönüş" aria-pressed="true" onClick={() => engine.current?.toggleAuto()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h11l-3-3M19 16H8l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" aria-label="Tam ekran" onClick={fullscreen}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}
