'use client';

import { useSite } from '../SiteProvider';
import { Icon } from '../Icon';

export default function Steel() {
  const { t } = useSite();
  return (
    <section className="steel" id="surdurulebilirlik">
      <div className="steel__t">
        <h2 className="h2">{t('eco.h')}</h2>
        <div>
          <p className="lead">{t('v.ep')}</p>
          <ul className="chips">
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>
                <i><Icon n="ok" /></i>
                <span>{t(`tag.${n}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <dl className="rings">
        <div className="ring ring--g">
          <dt>{t('v.f1l')}</dt>
          <dd className="ring__big">1951</dd>
        </div>
        <div className="ring ring--w">
          <dt>{t('sp.2l')}</dt>
          <dd>{t('sp.2v')}</dd>
        </div>
        <div className="ring ring--o">
          <dt>{t('sp.4l')}</dt>
          <dd>{t('v.f4v')}</dd>
        </div>
        <div className="ring ring--l">
          <dt>{t('sp.5l')}</dt>
          <dd>{t('sp.5v')}</dd>
        </div>
      </dl>
    </section>
  );
}
