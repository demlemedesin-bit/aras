'use client';

import { LANGS } from '@/lib/i18n';
import { prefersReducedMotion, useSite } from '../SiteProvider';
import { Icon } from '../Icon';
import { linkText } from '@/lib/site-config';

export default function Footer() {
  const { t, u, lang, openLang, content, openCatalog } = useSite();
  const langName = LANGS.find((l) => l.c === lang)?.n ?? 'Türkçe';
  return (
    <footer className="ft">
      <p className="ft__tag">{t('ft.tag')}</p>
      <ul className="ft__l">
        {content.nav.footer.filter((l) => l.show).map((l) => (
          <li key={l.id}>
            {l.href === '#katalog' ? (
              <a href="#katalog" onClick={(e) => { e.preventDefault(); openCatalog(); }}>{linkText(l, lang, t)}</a>
            ) : (
              <a href={l.href} {...(/^https?:/.test(l.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{linkText(l, lang, t)}</a>
            )}
          </li>
        ))}
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
