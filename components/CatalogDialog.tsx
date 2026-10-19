'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { sendSubmission } from '@/lib/submit';
import { useSite } from './SiteProvider';
import { Icon } from './Icon';

/** "Katalog iste": formu doldurur, talep panele düşer. E-posta uygulaması açılmaz. */
export default function CatalogDialog() {
  const { t, lang, catalogOpen, closeCatalog } = useSite();
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const dlg = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!catalogOpen) return;
    setState('idle');
    const id = setTimeout(() => first.current?.focus(), 80);
    return () => clearTimeout(id);
  }, [catalogOpen]);

  useEffect(() => {
    if (!catalogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return closeCatalog();
      if (e.key !== 'Tab' || !dlg.current) return;
      const f = Array.from(dlg.current.querySelectorAll<HTMLElement>('button,input,textarea,a[href]')).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { z.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === z) { a.focus(); e.preventDefault(); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [catalogOpen, closeCatalog]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    setState('sending');
    const ok = await sendSubmission({
      name: String(d.get('name')), email: String(d.get('email')), company: String(d.get('company') ?? ''),
      phone: String(d.get('phone') ?? ''), country: String(d.get('country') ?? ''), message: String(d.get('msg') ?? ''),
      topic: 'catalog', lang,
    });
    if (ok) form.reset();
    setState(ok ? 'ok' : 'err');
  };

  return (
    <div className={`auth${catalogOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="cat-h" data-view="in" ref={dlg}>
      <div className="auth__scrim" onClick={closeCatalog} />
      <div className="auth__box">
        <aside className="auth__side">
          <span className="auth__lock"><Icon n="arr" /></span>
          <h2 id="cat-h">{t('cat.h')}</h2>
          <p>{t('cat.p')}</p>
        </aside>
        <div className="auth__main">
          <button className="auth__x round" type="button" aria-label="×" onClick={closeCatalog}><Icon n="x" /></button>
          <div className="auth__guest">
            {state === 'ok' ? (
              <p role="status" style={{ fontSize: '1.25rem', lineHeight: 1.4 }}>{t('cat.ok')}</p>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <label><span>{t('f.name')}</span><input ref={first} name="name" type="text" required autoComplete="name" /></label>
                <label><span>{t('f.comp')}</span><input name="company" type="text" autoComplete="organization" /></label>
                <label><span>{t('f.mail')}</span><input name="email" type="email" required autoComplete="email" inputMode="email" /></label>
                <label><span>{t('f.phone')}</span><input name="phone" type="tel" autoComplete="tel" /></label>
                <label><span>{t('f.country')}</span><input name="country" type="text" autoComplete="country-name" /></label>
                <label><span>{t('f.msg')}</span><input name="msg" type="text" /></label>
                <p className="auth__err" role="alert">{state === 'err' ? t('f.err') : ''}</p>
                <button className="btn auth__go" type="submit" disabled={state === 'sending'}>{state === 'sending' ? t('f.sending') : t('cat.send')}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
