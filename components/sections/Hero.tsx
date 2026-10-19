'use client';

import { HERO } from '@/lib/data';
import { useSite } from '../SiteProvider';
import { Icon } from '../Icon';

function Ring() {
  return (
    <svg className="show__ring" viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 68A46 46 0 0 1 105.3 52" />
        <path d="M112.1 38.6 105.3 52 94.3 41.8" />
        <path d="M105.3 68A46 46 0 0 1 14.7 52" />
        <path d="M21.5 65.4 14.7 52 3.7 62.2" />
      </g>
      <text x="60" y="70" textAnchor="middle" fontSize="28" fontWeight="700" fill="currentColor">360°</text>
    </svg>
  );
}

export default function Hero() {
  const { t, pickWorld, openTour } = useSite();
  return (
    <section className="hero" id="top">
      <div className="hero__g">
        <div className="show" style={{ backgroundImage: `url(${HERO.showroom})` }}>
          <h1 className="show__h">{t('hero.h')}</h1>
          <p className="show__p">{t('hero.p')}</p>
          <Ring />
          <button className="show__btn" type="button" onClick={(e) => openTour(e.currentTarget)}>
            <span>{t('hero.tour')}</span>
            <Icon n="arr" />
          </button>
        </div>
        <div className="hero__cards">
          <a className="card card--ev" href="#koleksiyonlar" onClick={(e) => { e.preventDefault(); pickWorld('home', 'koleksiyonlar'); }}>
            <img className="card__img" src={HERO.home} alt="" width={1000} height={1250} />
            <span className="card__t">{t('tab.home')}</span>
            <span className="card__d">{t('hero.home.d')}</span>
            <span className="card__l">{t('tab.gohome')}<Icon n="arr" /></span>
          </a>
          <a className="card card--ga" href="#koleksiyonlar" onClick={(e) => { e.preventDefault(); pickWorld('garden', 'koleksiyonlar'); }}>
            <img className="card__img" src={HERO.garden} alt="" width={900} height={900} />
            <span className="card__t">{t('tab.garden')}</span>
            <span className="card__d">{t('hero.garden.d')}</span>
            <span className="card__l">{t('tab.gogarden')}<Icon n="arr" /></span>
          </a>
        </div>
      </div>
      <div className="hero__band">
        <div>
          <h2>{t('v.h1')}</h2>
          <p>{t('v.sub')}</p>
        </div>
        <a className="hero__dn" href="#hakkimizda" aria-label="↓">
          <Icon n="down" />
        </a>
      </div>
    </section>
  );
}
