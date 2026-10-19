'use client';

import { useSite } from '../SiteProvider';

export default function About() {
  const { t } = useSite();
  return (
    <section className="about" id="hakkimizda">
      <figure className="about__f">
        <img src="/images/about.webp" alt="" loading="lazy" width={900} height={1200} />
      </figure>
      <div className="about__t">
        <h2 className="h2">{t('v.ah')}</h2>
        <p className="lead">{t('v.ap')}</p>
        <h3 className="h4">{t('v.th')}</h3>
        <ol className="tl">
          {[1, 2, 3].map((n) => (
            <li key={n}>
              <span>{t(`tl.${n}s`)}</span>
              <b>{t(`tl.${n}h`)}</b>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
