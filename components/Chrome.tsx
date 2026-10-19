'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LANGS } from '@/lib/i18n';
import { prefersReducedMotion, useSite } from './SiteProvider';
import { Icon } from './Icon';
import { catName } from '@/lib/categories';
import { linkText } from '@/lib/site-config';

const SECTIONS = [
  { id: 'tarihce', key: 'nav.hist' },
  { id: 'koleksiyonlar', key: 'nav.col' },
  { id: 'urunler', key: 'nav.prod' },
  { id: 'haberler', key: 'nav.fair' },
  { id: 'hakkimizda', key: 'nav.about' },
  { id: 'showroom', key: 'nav.sr' },
  { id: 'iletisim', key: 'nav.contact' },
] as const;


/** Ekranın ortasındaki bölümün id'sini döndürür. */
function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    let ticking = false;
    const spy = () => {
      ticking = false;
      const mid = innerHeight * 0.5;
      let hit: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) hit = id;
      }
      setActive(hit);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(spy);
      }
    };
    spy();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, [ids]);
  return active;
}

export default function Chrome() {
  const { t, u, lang, langOpen, openLang, session, openAuth, A, openCatalog, pickWorld, content } = useSite();
  const ids = SECTIONS.map((s) => s.id);
  const active = useScrollSpy(ids);
  const dock = useRef<HTMLElement>(null);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    document.documentElement.style.overflow = menu ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [menu]);
  const curTag = LANGS.find((l) => l.c === lang)?.tag ?? 'TR';
  const authLabel = session ? `${A.hi}${session.name.split(' ')[0]}` : A.btn;

  // Dock taşıyorsa aktif bağlantıyı ortala (mobil).
  useEffect(() => {
    const d = dock.current;
    if (!d || !active || d.scrollWidth <= d.clientWidth) return;
    const a = d.querySelector<HTMLElement>('a[aria-current]');
    if (a) d.scrollTo({ left: a.offsetLeft - (d.clientWidth - a.offsetWidth) / 2, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [active]);

  const login = useCallback(() => openAuth(), [openAuth]);

  return (
    <>
      <a className="skip" href="#icerik">{t('skip')}</a>
      <header className="top">
        <a className="top__logo" href="#top" aria-label="Aras Metal">
          <img src="/images/logo.png" alt="" width={340} height={130} />
        </a>
        <nav className="top__nav" aria-label={u('menu')}>
          {(['home', 'garden'] as const).map((w) => (
            <div className="mm" key={w}>
              <a
                href="#koleksiyonlar"
                className="mm__b"
                onClick={(e) => { e.preventDefault(); pickWorld(w, 'koleksiyonlar'); }}
              >
                {t(w === 'home' ? 'tab.home' : 'tab.garden')}
                <Icon n="arr" rotate={90} />
              </a>
              <ul className="mm__p">
                {content.categories.filter((m) => m.world === w).map((m) => (
                  <li key={m.id}>
                    <a
                      href={session ? `/bayi/urunler?k=${m.id}` : '#koleksiyonlar'}
                      onClick={session ? undefined : (e) => { e.preventDefault(); pickWorld(w, 'koleksiyonlar'); }}
                    >
                      {catName(m.name, lang)}
                    </a>
                    {m.subs.length > 0 && (
                      <ul>
                        {m.subs.map((x) => (
                          <li key={x.id}>
                            <a
                              href={session ? `/bayi/urunler?k=${m.id}` : '#koleksiyonlar'}
                              onClick={session ? undefined : (e) => { e.preventDefault(); pickWorld(w, 'koleksiyonlar'); }}
                            >
                              {catName(x.name, lang)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {content.nav.header.filter((l) => l.show).map((l) => (
            <a key={l.id} href={l.href} aria-current={active === l.id ? 'true' : undefined} {...(/^https?:/.test(l.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {linkText(l, lang, t)}
            </a>
          ))}
        </nav>
        <div className="top__r">
          <button className="burger" type="button" aria-expanded={menu} aria-label={u('menu')} onClick={() => setMenu((m) => !m)}>
            <span /><span /><span />
          </button>
          <button className={`pill authbtn${session ? ' on' : ''}`} type="button" aria-haspopup="dialog" onClick={login}>
            <Icon n="lock" />
            <span>{authLabel}</span>
          </button>
          <button
            className="pill langbtn"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={langOpen}
            aria-label={u('lang')}
            onClick={(e) => openLang(!langOpen, e.currentTarget)}
          >
            <Icon n="globe" />
            <span>{curTag}</span>
          </button>
          <button className="pill pill--k top__cta" type="button" aria-haspopup="dialog" onClick={openCatalog}>
            <span>{t('cta.cat')}</span>
            <Icon n="arr" />
          </button>
        </div>
      </header>

      <nav className="dock" ref={dock} aria-label={u('menu')}>
        {content.nav.dock.filter((l) => l.show).map((l) => (
          <a key={l.id} href={l.href} aria-current={active === l.id ? 'true' : undefined}>
            {linkText(l, lang, t)}
          </a>
        ))}
      </nav>

      {menu && (
        <div className="drw" role="dialog" aria-label={u('menu')}>
          {(['home', 'garden'] as const).map((w) => (
            <details key={w} className="drw__g">
              <summary>{t(w === 'home' ? 'tab.home' : 'tab.garden')}</summary>
              <ul>
                {content.categories.filter((m) => m.world === w).map((m) => {
                  const href = session ? `/bayi/urunler?k=${m.id}` : '#koleksiyonlar';
                  const go = (e: React.MouseEvent) => {
                    if (session) return;
                    e.preventDefault();
                    setMenu(false);
                    pickWorld(w, 'koleksiyonlar');
                  };
                  return m.subs.length ? (
                    <li key={m.id}>
                      <details>
                        <summary>{catName(m.name, lang)}</summary>
                        <ul>
                          {m.subs.map((x) => (
                            <li key={x.id}><a href={href} onClick={go}>{catName(x.name, lang)}</a></li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  ) : (
                    <li key={m.id}><a href={href} onClick={go}>{catName(m.name, lang)}</a></li>
                  );
                })}
              </ul>
            </details>
          ))}
          {content.nav.header.filter((l) => l.show && l.id !== 'koleksiyonlar').map((l) => (
            <a key={l.id} className="drw__l" href={l.href} onClick={() => setMenu(false)}>{linkText(l, lang, t)}</a>
          ))}
        </div>
      )}
    </>
  );
}

