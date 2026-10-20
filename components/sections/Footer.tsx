'use client';

import { LANGS } from '@/lib/i18n';
import { prefersReducedMotion, useSite } from '../SiteProvider';
import { Icon } from '../Icon';
import { lp } from '@/lib/lang-path';
import { kindOf, linkText } from '@/lib/site-config';

export default function Footer() {
  const { t, u, lang, openLang, content, openCatalog, openAuth, openTour } = useSite();
  const langName = LANGS.find((l) => l.c === lang)?.n ?? 'Türkçe';
  return (
    <footer className="ft">
      <p className="ft__tag">{t('ft.tag')}</p>
      <ul className="ft__l">
        {content.nav.footer.filter((l) => l.show).map((l) => {
          const k = kindOf(l);
          const act = (e: React.MouseEvent<HTMLElement>) => {
            if (k === 'catalog') { e.preventDefault(); openCatalog(); }
            else if (k === 'login') { e.preventDefault(); openAuth(); }
            else if (k === 'lang') { e.preventDefault(); openLang(true, e.currentTarget); }
            else if (k === 'tour') { e.preventDefault(); openTour(e.currentTarget); }
          };
          return (
            <li key={l.id}>
              <a href={['catalog', 'login', 'lang', 'tour'].includes(k) ? '#' : lp(lang, l.href)} onClick={act} {...(k === 'url' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{linkText(l, lang, t)}</a>
            </li>
          );
        })}
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
