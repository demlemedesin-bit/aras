'use client';

import { track } from '@/lib/track';
import { useSite } from '../SiteProvider';
import { Icon } from '../Icon';

export default function Products() {
  const { t, world, openCatalog, session, content } = useSite();
  const open = (code: string) => (track('event', 'product_click'), session ? location.assign(`/bayi/urunler?q=${encodeURIComponent(code)}`) : openCatalog());
  const list = content.products.filter((p) => world === 'all' || p.world === world).slice(0, 12);
  // Kesintisiz akış için liste iki kez dizilir; ikinci kopya yalnızca görseldir.
  const loop = list.length ? [...list, ...list] : [];

  return (
    <section className="sec prods" id="urunler">
      <div className="head">
        <h2 className="h2">{t('prod.h')}</h2>
        <div className="head__r">
          <button className="pill pill--w" type="button" onClick={openCatalog}>
            <span>{t('prod.ask')}</span>
            <Icon n="ne" />
          </button>
        </div>
      </div>
      <div className="marq" key={world}>
        <ul className="marq__t" style={{ animationDuration: `${Math.max(30, list.length * 6)}s` }}>
          {loop.map((p, i) => {
            const dup = i >= list.length;
            return (
              <li key={`${p.id}-${i}`} aria-hidden={dup || undefined}>
                <button className="pc" type="button" onClick={() => open(p.code)} tabIndex={dup ? -1 : 0} draggable={false}>
                  <span className="disc pc__d">
                    <img src={p.img} alt={dup ? '' : t(p.name)} loading="lazy" width={640} height={640} draggable={false} />
                    <i className="pc__i"><Icon n="ne" /></i>
                  </span>
                  <span className="pc__t">
                    <span className="code">{p.code}</span>
                    <b>{t(p.name)}</b>
                  </span>
                  <small>{t(p.cat)}</small>
                  <span className="pc__ask">{t('prod.ask')}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
