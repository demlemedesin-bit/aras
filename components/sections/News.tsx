'use client';

import { useState } from 'react';
import { useSite } from '../SiteProvider';
import { Icon } from '../Icon';

export default function News() {
  const { t, content } = useSite();
  const [tab, setTab] = useState<'fairs' | 'awards'>('fairs');
  const list = content.news.filter((n) => (tab === 'awards') === !!n.award);
  return (
    <section className="sec news" id="haberler">
      <div className="head">
        <h2 className="h2">{t('news.h')}</h2>
        <div className="seg" role="group">
          {(['fairs', 'awards'] as const).map((k) => (
            <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>
              {t(`fair.${k}`)}
            </button>
          ))}
        </div>
      </div>
      <ul className="nws">
        {list.map((n) => (
          <li key={n.href} className={'award' in n && n.award ? 'aw' : undefined}>
            <a className="nw" href={n.href} target="_blank" rel="noopener">
              <span className="nw__d">{n.year ?? t(n.d)}</span>
              <h3>
                {n.badge && <em>{t(n.badge)}</em>} <span>{t(n.h)}</span>
              </h3>
              <i className="go"><Icon n="ne" /></i>
            </a>
          </li>
        ))}
      </ul>
      {!list.length && <p className="hist__empty">{t('fair.empty')}</p>}
      <div className="part">
        <h2 className="h4">{t('part.h')}</h2>
        <div className="logos">
          {content.partners.map((p) => (
            <a key={p.name} href={p.href} target="_blank" rel="noopener">
              <img src={p.img} alt={p.name} loading="lazy" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
