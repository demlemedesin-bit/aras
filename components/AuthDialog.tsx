'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { submitAuth } from '@/lib/auth';
import { track } from '@/lib/track';
import { useSite } from './SiteProvider';
import { Icon } from './Icon';

export default function AuthDialog() {
  const { auth, closeAuth, session, signedIn, signOut, A, lang } = useSite();
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [err, setErr] = useState('');
  const dlg = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const outRef = useRef<HTMLButtonElement>(null);
  const next = useRef<string | null>(null);
  const view = session ? 'acct' : mode;

  // Açılışta odak ve sekme sıfırlama.
  useEffect(() => {
    if (!auth.open) return;
    next.current = auth.next;
    setErr('');
    setPending(false);
    setMode('in');
    const id = setTimeout(() => (session ? outRef.current : emailRef.current)?.focus(), 80);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.open]);

  useEffect(() => {
    if (!auth.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuth();
        return;
      }
      if (e.key !== 'Tab' || !dlg.current) return;
      const f = Array.from(dlg.current.querySelectorAll<HTMLElement>('button,input,a[href]')).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { z.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === z) { a.focus(); e.preventDefault(); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [auth.open, closeAuth]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    if (busy) return;
    setBusy(true);
    const res = await submitAuth({
      lang,
      mode,
      email: String(d.get('em') ?? ''),
      password: String(d.get('pw') ?? ''),
      name: String(d.get('nm') ?? ''),
      company: String(d.get('co') ?? ''),
      phone: String(d.get('ph') ?? ''),
    });
    setBusy(false);
    if (!res.ok) {
      setErr(A[res.err] ?? A.e8 ?? '');
      return;
    }
    form.reset();
    track('event', mode === 'up' ? 'dealer_register' : 'dealer_login');
    if (!res.session) {
      setPending(true);
      setMode('in');
      return;
    }
    signedIn(res.session);
    closeAuth();
    const target = next.current;
    next.current = null;
    window.location.assign(target && target.startsWith('/') ? target : '/bayi/urunler');
  };

  const up = mode === 'up';
  return (
    <div className={`auth${auth.open ? ' open' : ''}`} id="auth" role="dialog" aria-modal="true" aria-labelledby="auth-h" data-view={view} ref={dlg}>
      <div className="auth__scrim" onClick={closeAuth} />
      <div className="auth__box">
        <aside className="auth__side">
          <span className="auth__lock"><Icon n="lock" /></span>
          <h2 id="auth-h">{A.h}</h2>
          <p>{A.p}</p>
          <ul>
            <li>{A.b1}</li>
            <li>{A.b2}</li>
            <li>{A.b3}</li>
          </ul>
        </aside>
        <div className="auth__main">
          <button className="auth__x round" type="button" aria-label={A.cl} onClick={closeAuth}>
            <Icon n="x" />
          </button>
          <div className="auth__guest">
            {pending && (
              <div role="status" className="auth__pending">
                <h3>{A.pd}</h3>
                <p>{A.pp}</p>
              </div>
            )}
            <div className="auth__tabs" role="tablist">
              <button className="auth__tab" type="button" role="tab" aria-selected={mode === 'in'} onClick={() => { setMode('in'); setErr(''); }}>{A.tin}</button>
              <button className="auth__tab" type="button" role="tab" aria-selected={mode === 'up'} onClick={() => { setMode('up'); setErr(''); }}>{A.tup}</button>
            </div>
            <form onSubmit={onSubmit} noValidate>
              {up && (
                <label><span>{A.nm}</span><input name="nm" type="text" autoComplete="name" /></label>
              )}
              {up && (
                <label><span>{A.co}</span><input name="co" type="text" autoComplete="organization" /></label>
              )}
              <label><span>{A.em}</span><input ref={emailRef} name="em" type="email" autoComplete="email" inputMode="email" /></label>
              {up && (
                <label><span>{A.ph}</span><input name="ph" type="tel" autoComplete="tel" /></label>
              )}
              <label><span>{A.pw}</span><input name="pw" type="password" autoComplete={up ? 'new-password' : 'current-password'} /></label>
              <p className="auth__err" role="alert">{err}</p>
              <button className="btn auth__go" type="submit" disabled={busy}>{up ? A.sup : A.sin}</button>
            </form>
          </div>
          <div className="auth__acct">
            <h3>{A.ah}</h3>
            <p>{A.ap}</p>
            <a className="btn auth__go" href="/bayi/urunler">{A.go}</a>
            <button className="btn btn--line" ref={outRef} type="button" onClick={() => { signOut(); closeAuth(); }}>{A.out}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
