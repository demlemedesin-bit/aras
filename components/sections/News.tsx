'use client';

import { NEWS, PARTNERS } from '@/lib/data';
import { useSite } from '../SiteProvider';
import { Icon } from '../Icon';

export default function News() {
  const { t } = useSite();
  return (
    <section className="sec news" id="haberler">
      <div className="head">
        <h2 className="h2">{t('news.h')}</h2>
      </div>
      <ul className="nws">
        {NEWS.map((n) => (
          <li key={n.href} className={'award' in n && n.award ? 'aw' : undefined}>
            <a className="nw" href={n.href} target="_blank" rel="noopener">
              <span className="nw__d">{'year' in n ? n.year : t(n.d)}</span>
              <h3>
                {'badge' in n && <em>{t(n.badge)}</em>} <span>{t(n.h)}</span>
              </h3>
              <i className="go"><Icon n="ne" /></i>
            </a>
          </li>
        ))}
      </ul>
      <div className="part">
        <h2 className="h4">{t('part.h')}</h2>
        <div className="logos">
          {PARTNERS.map((p) => (
            <a key={p.name} href={p.href} target="_blank" rel="noopener">
              <img src={p.img} alt={p.name} loading="lazy" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
