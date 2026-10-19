'use client';

import { useSite } from '../SiteProvider';
import { Icon } from '../Icon';

export default function About() {
  const { t, openCatalog, content } = useSite();
  return (
    <section className="about" id="hakkimizda">
      <figure className="about__f">
        <img src={content.hero.about || '/images/about.webp'} alt="" loading="lazy" width={900} height={1200} />
      </figure>
      <div className="about__t">
        <h2 className="h2">{t('about.h')}</h2>
        <p className="lead">{t('about.p1')}</p>
        <p className="about__p">{t('about.p2')}</p>
        <button className="pill pill--k about__cta" type="button" onClick={openCatalog}>
          <span>{t('cta.cat')}</span>
          <Icon n="arr" />
        </button>
      </div>
    </section>
  );
}
