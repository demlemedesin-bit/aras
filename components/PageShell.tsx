'use client';

import { useEffect, type ReactNode } from 'react';
import { SiteProvider, useSite } from './SiteProvider';
import { Sprite, Icon } from './Icon';
import Footer from './sections/Footer';
import AuthDialog from './AuthDialog';
import CatalogDialog from './CatalogDialog';
import LangPanel from './LangPanel';
import type { Content } from '@/lib/content';

function Bar() {
  const { openLang, lang } = useSite();
  return (
    <header className="top top--sub">
      <a className="top__logo" href="/" aria-label="Aras Metal">
        <img src="/images/logo.png" alt="" width={340} height={130} />
      </a>
      <div className="top__r">
        <a className="pill" href="/"><span>Aras Metal</span><Icon n="arr" rotate={180} /></a>
        <button className="pill langbtn" type="button" aria-haspopup="dialog" onClick={(e) => openLang(true, e.currentTarget)}>
          <Icon n="globe" />
          <span>{lang.toUpperCase()}</span>
        </button>
      </div>
    </header>
  );
}

export default function PageShell({ content, children }: { content: Content; children: ReactNode }) {
  // Ana sayfadaki açılış ekranı bu sayfalarda yok; kaydırma kilidini kaldır.
  useEffect(() => {
    document.documentElement.classList.remove('pre-lock');
  }, []);
  return (
    <SiteProvider content={content}>
      <Sprite />
      <Bar />
      <main id="icerik" className="sub">{children}</main>
      <Footer />
      <AuthDialog />
      <CatalogDialog />
      <LangPanel />
    </SiteProvider>
  );
}
