'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CODES, metaFor, tr, ui, type Lang } from '@/lib/i18n';
import { clearSession, readSession, type Session } from '@/lib/auth';
import type { World } from '@/lib/data';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Site metni */
  t: (key: string) => string;
  /** Arayüz etiketi */
  u: (key: string) => string;
  world: World;
  /** Ev / Bahçe filtresini seçer; scrollTo verilirse o bölüme kaydırır. */
  pickWorld: (w: World, scrollTo?: string) => void;
  langOpen: boolean;
  openLang: (open: boolean, from?: HTMLElement | null) => void;
  session: Session | null;
  signedIn: (s: Session) => void;
  signOut: () => void;
  auth: { open: boolean; next: string | null };
  openAuth: (next?: string | null) => void;
  closeAuth: () => void;
  tourOpen: boolean;
  openTour: (from?: HTMLElement | null) => void;
  closeTour: () => void;
};

const SiteCtx = createContext<Ctx | null>(null);

export function useSite(): Ctx {
  const c = useContext(SiteCtx);
  if (!c) throw new Error('useSite yalnızca SiteProvider içinde kullanılabilir');
  return c;
}

export const prefersReducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function SiteProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr');
  const [world, setWorld] = useState<World>('all');
  const [langOpen, setLangOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [auth, setAuth] = useState<{ open: boolean; next: string | null }>({ open: false, next: null });
  const [tourOpen, setTourOpen] = useState(false);
  const lastLang = useRef<HTMLElement | null>(null);
  const lastAuth = useRef<HTMLElement | null>(null);
  const lastTour = useRef<HTMLElement | null>(null);

  const setLang = useCallback((l: Lang) => {
    const next = CODES.includes(l) ? l : 'tr';
    setLangState(next);
    try {
      localStorage.setItem('aras-lang', next);
    } catch {
      /* depolama kapalı */
    }
  }, []);

  // Açılışta kayıtlı dil, yoksa tarayıcı dili (desteklenmiyorsa İngilizce); oturumu geri yükle.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('aras-lang');
    } catch {
      /* depolama kapalı */
    }
    const nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'tr').slice(0, 2).toLowerCase();
    const pick = (saved && CODES.includes(saved as Lang) ? saved : CODES.includes(nav as Lang) ? nav : 'en') as Lang;
    setLangState(pick);
    setSession(readSession());
  }, []);

  // Dil değişince <html lang>, başlık ve açıklama güncellenir.
  useEffect(() => {
    document.documentElement.lang = lang;
    const m = metaFor(lang);
    document.title = m.title;
    document.querySelector('meta[name=description]')?.setAttribute('content', m.desc);
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('lang-open', langOpen);
    root.classList.toggle('auth-open', auth.open);
    root.style.overflow = tourOpen ? 'hidden' : '';
  }, [langOpen, auth.open, tourOpen]);

  const pickWorld = useCallback((w: World, scrollTo?: string) => {
    setWorld(w);
    if (scrollTo) {
      const el = document.getElementById(scrollTo);
      el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  }, []);

  const openLang = useCallback((open: boolean, from?: HTMLElement | null) => {
    if (from) lastLang.current = from;
    setLangOpen(open);
    if (!open) lastLang.current?.focus();
  }, []);

  const openAuth = useCallback((next?: string | null) => {
    lastAuth.current = document.activeElement as HTMLElement | null;
    setAuth({ open: true, next: next ?? null });
  }, []);
  const closeAuth = useCallback(() => {
    setAuth((a) => ({ ...a, open: false }));
    lastAuth.current?.focus?.();
  }, []);

  const openTour = useCallback((from?: HTMLElement | null) => {
    lastTour.current = from ?? (document.activeElement as HTMLElement | null);
    setTourOpen(true);
  }, []);
  const closeTour = useCallback(() => {
    setTourOpen(false);
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    lastTour.current?.focus?.();
  }, []);

  const signedIn = useCallback((s: Session) => setSession(s), []);
  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (k) => tr(lang, k),
      u: (k) => ui(lang, k),
      world,
      pickWorld,
      langOpen,
      openLang,
      session,
      signedIn,
      signOut,
      auth,
      openAuth,
      closeAuth,
      tourOpen,
      openTour,
      closeTour,
    }),
    [lang, setLang, world, pickWorld, langOpen, openLang, session, signedIn, signOut, auth, openAuth, closeAuth, tourOpen, openTour, closeTour],
  );

  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}
