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
      </div>
    </section>
  );
}
