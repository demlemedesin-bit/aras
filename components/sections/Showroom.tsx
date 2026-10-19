'use client';

import { useSite } from '../SiteProvider';
import { Icon } from '../Icon';

export default function Showroom() {
  const { t, pickWorld, openTour } = useSite();
  const pick = (w: 'home' | 'garden') => pickWorld(w, 'koleksiyonlar');
  return (
    <section className="sec sr" id="showroom">
      <div className="sr__h">
        <h2 className="h2">{t('sr.h')}</h2>
        <div className="sr__l">
          <button className="pill pill--k" type="button" onClick={() => pick('home')}>
            <span>{t('tab.home')}</span>
            <Icon n="arr" />
          </button>
          <button className="pill pill--k" type="button" onClick={() => pick('garden')}>
            <span>{t('tab.garden')}</span>
            <Icon n="arr" />
          </button>
        </div>
      </div>
      <div className="sr__w">
        <div className="sr__cap">
          <div className="sr__s">
            <img src="/images/showroom.webp" alt="Aras Metal showroom" width={2576} height={614} loading="lazy" />
            <button className="hs" type="button" style={{ left: '22%', top: '34%' }} onClick={() => pick('garden')}>
              <i />
              <span>{t('sr.hs2')}</span>
            </button>
            <button className="hs" type="button" style={{ left: '68%', top: '66%' }} onClick={() => pick('home')}>
              <i />
              <span>{t('sr.hs1')}</span>
            </button>
          </div>
        </div>
        <button className="tourdisc" type="button" onClick={(e) => openTour(e.currentTarget)}>
          <span>{t('sr.tour')}</span>
        </button>
      </div>
    </section>
  );
}
