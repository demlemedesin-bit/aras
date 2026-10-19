'use client';

import { LANGS } from '@/lib/i18n';
import { prefersReducedMotion, useSite } from '../SiteProvider';
import { Icon } from '../Icon';

export default function Footer() {
  const { t, u, lang, openLang, content, openCatalog } = useSite();
  const langName = LANGS.find((l) => l.c === lang)?.n ?? 'Türkçe';
  return (
    <footer className="ft">
      <p className="ft__tag">{t('ft.tag')}</p>
      <ul className="ft__l">
        <li><a href="#hakkimizda">{t('nav.about')}</a></li>
        <li><a href="#tarihce">{t('nav.hist')}</a></li>
        <li><a href="#showroom">{t('nav.sr')}</a></li>
        <li><a href="#haberler">{t('nav.fair')}</a></li>
        <li><a href="https://arasmetal.com/careers/" target="_blank" rel="noopener">{t('ft.car')}</a></li>
        <li><a href="https://arasmetal.com/faq/" target="_blank" rel="noopener">{t('ft.faq')}</a></li>
        <li><a href="https://arasmetal.com/privacy-policy/" target="_blank" rel="noopener">{t('ft.priv')}</a></li>
        <li><a href="#katalog" onClick={(e) => { e.preventDefault(); openCatalog(); }}>{t('cta.cat')}</a></li>
      </ul>
      <div className="ft__bar">
        <button className="pill pill--w" type="button" aria-haspopup="dialog" onClick={(e) => openLang(true, e.currentTarget)}>
          <Icon n="globe" />
          <span>{langName}</span>
        </button>
        <p className="ft__legal">
          <span>{t('ft.copy')}</span>
          <span>{t('ft.loc')}</span>
        </p>
        <button className="round round--w" type="button" aria-label={u('up')} onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}>
          <Icon n="arr" rotate={-90} />
        </button>
      </div>
    </footer>
  );
}
