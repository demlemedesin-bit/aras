'use client';
import { track } from '@/lib/track';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CODES, META_TR, type Dict, type Lang } from '@/lib/i18n';
import { dictFor, type Content } from '@/lib/content';
import { clearSession, readSession, type Session } from '@/lib/auth';
import type { World } from '@/lib/data';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Site metni */
  t: (key: string) => string;
  /** Arayüz etiketi */
  u: (key: string) => string;
  /** Bayi girişi metinleri */
  A: Dict;
  /** Yönetilebilir site içeriği */
  content: Content;
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
  catalogOpen: boolean;
  openCatalog: () => void;
  closeCatalog: () => void;
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

export function SiteProvider({ children, content }: { children: ReactNode; content: Content }) {
  const [lang, setLangState] = useState<Lang>('tr');
  const [world, setWorld] = useState<World>('all');
  const [langOpen, setLangOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [auth, setAuth] = useState<{ open: boolean; next: string | null }>({ open: false, next: null });
  const [tourOpen, setTourOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const lastCatalog = useRef<HTMLElement | null>(null);
  const lastLang = useRef<HTMLElement | null>(null);
  const lastAuth = useRef<HTMLElement | null>(null);
  const lastTour = useRef<HTMLElement | null>(null);

  const setLang = useCallback((l: Lang) => {
    const next = CODES.includes(l) ? l : 'tr';
    setLangState(next);
    track('event', 'lang_change');
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
    // Kayıtlı dil yoksa ülkeye göre otomatik seç (ör. İngiltere → İngilizce).
    if (!saved) {
      fetch('/api/geo', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((g) => {
          if (g?.lang && CODES.includes(g.lang)) {
            setLangState(g.lang as Lang);
            try { localStorage.setItem('aras-lang', g.lang); } catch { /* depolama kapalı */ }
          }
        })
        .catch(() => {});
    }
    readSession().then(setSession);
  }, []);

  // Dil değişince <html lang>, başlık ve açıklama güncellenir.
  useEffect(() => {
    document.documentElement.lang = lang;
    const mt = content.texts.meta;
    const m = { title: mt.title?.[lang] ?? mt.title?.tr ?? META_TR.title, desc: mt.desc?.[lang] ?? mt.desc?.tr ?? META_TR.desc };
    document.title = m.title;
    document.querySelector('meta[name=description]')?.setAttribute('content', m.desc);
  }, [lang, content]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('lang-open', langOpen);
    root.classList.toggle('auth-open', auth.open || catalogOpen);
    root.style.overflow = tourOpen ? 'hidden' : '';
  }, [langOpen, auth.open, catalogOpen, tourOpen]);

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
    track('event', 'tour_open');
  }, []);
  const closeTour = useCallback(() => {
    setTourOpen(false);
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    lastTour.current?.focus?.();
  }, []);

  const openCatalog = useCallback(() => {
    lastCatalog.current = document.activeElement as HTMLElement | null;
    setCatalogOpen(true);
    track('event', 'catalog_open');
  }, []);
  const closeCatalog = useCallback(() => {
    setCatalogOpen(false);
    lastCatalog.current?.focus?.();
  }, []);

  const signedIn = useCallback((s: Session) => setSession(s), []);
  const signOut = useCallback(() => {
    void clearSession();
    setSession(null);
  }, []);

  const dicts = useMemo(() => ({ t: dictFor(content, 't', lang), ui: dictFor(content, 'ui', lang), auth: dictFor(content, 'auth', lang) }), [content, lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (k) => dicts.t[k] ?? k,
      u: (k) => dicts.ui[k] ?? k,
      A: dicts.auth,
      content,
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
      catalogOpen,
      openCatalog,
      closeCatalog,
      tourOpen,
      openTour,
      closeTour,
    }),
    [lang, setLang, dicts, content, world, pickWorld, langOpen, openLang, session, signedIn, signOut, auth, openAuth, closeAuth, catalogOpen, openCatalog, closeCatalog, tourOpen, openTour, closeTour],
  );

  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}
