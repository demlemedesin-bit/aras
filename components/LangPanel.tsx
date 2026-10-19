'use client';

import { useEffect, useRef } from 'react';
import { LANGS } from '@/lib/i18n';
import { useSite } from './SiteProvider';
import { Icon } from './Icon';

export default function LangPanel() {
  const { lang, setLang, langOpen, openLang, u } = useSite();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!langOpen) return;
    const panel = box.current;
    if (!panel) return;
    const cur = panel.querySelector<HTMLElement>('.langpanel__list [aria-current]') ?? panel.querySelector<HTMLElement>('.langpanel__list button');
    const id = setTimeout(() => cur?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') openLang(false);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const bs = Array.from(panel.querySelectorAll<HTMLElement>('.langpanel__list button'));
        const i = bs.indexOf(document.activeElement as HTMLElement);
        bs[(i + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length].focus();
        e.preventDefault();
      }
      if (e.key === 'Tab') {
        const f = Array.from(panel.querySelectorAll<HTMLElement>('button'));
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    };
    addEventListener('keydown', onKey);
    return () => {
      clearTimeout(id);
      removeEventListener('keydown', onKey);
    };
  }, [langOpen, openLang]);

  return (
    <div className={`langpanel${langOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="lp-title" ref={box}>
      <div className="langpanel__scrim" onClick={() => openLang(false)} />
      <div className="langpanel__box">
        <div className="langpanel__top">
          <h2 id="lp-title">{u('title')}</h2>
          <button className="round" type="button" aria-label={u('close')} onClick={() => openLang(false)}>
            <Icon n="x" />
          </button>
        </div>
        <p className="langpanel__sub">{u('sub')}</p>
        <ul className="langpanel__list">
          {LANGS.map((l) => (
            <li key={l.c}>
              <button
                type="button"
                lang={l.c}
                aria-pressed={lang === l.c}
                aria-current={lang === l.c ? 'true' : undefined}
                onClick={() => {
                  setLang(l.c);
                  openLang(false);
                }}
              >
                <b>{l.n}</b>
                <small>{l.e}</small>
                <i aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
