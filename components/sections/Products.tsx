'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
import { prefersReducedMotion, useSite } from '../SiteProvider';
import { Icon } from '../Icon';

export default function Products() {
  const { t, u, world, session, openAuth, content } = useSite();
  const rail = useRef<HTMLUListElement>(null);
  const list = content.products.filter((p) => world === 'all' || p.world === world);

  useEffect(() => {
    if (rail.current) rail.current.scrollLeft = 0;
  }, [world]);

  // Fareyle sürükleyerek kaydırma; sürükleme sonrası tıklamayı engelle.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let drag = false, moved = false, sx = 0, sl = 0;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = true; moved = false; sx = e.clientX; sl = el.scrollLeft;
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 5) { moved = true; el.classList.add('dr'); }
      if (moved) el.scrollLeft = sl - dx;
    };
    const up = () => { drag = false; el.classList.remove('dr'); };
    const click = (e: Event) => {
      if (moved && e.target instanceof Element && e.target.closest('.rail')) {
        e.preventDefault();
        e.stopPropagation();
      }
      moved = false;
    };
    el.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('click', click, true);
    return () => {
      el.removeEventListener('pointerdown', down);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('click', click, true);
    };
  }, []);

  const scrollRail = (dir: number) => {
    const el = rail.current;
    if (!el) return;
    const li = el.querySelector('li');
    el.scrollBy({ left: (li ? li.offsetWidth + 40 : 320) * dir, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const gate = (e: MouseEvent, href: string) => {
    if (!session) {
      e.preventDefault();
      openAuth(href);
    }
  };

  return (
    <section className="sec prods" id="urunler">
      <div className="head">
        <h2 className="h2">{t('prod.h')}</h2>
        <div className="head__r">
          <a className="pill pill--w" href="https://arasmetal.com/products/" target="_blank" rel="noopener" onClick={(e) => gate(e, 'https://arasmetal.com/products/')}>
            <span>{t('prod.all')}</span>
            <Icon n="ne" />
          </a>
          <button className="round" type="button" aria-label={u('prev')} onClick={() => scrollRail(-1)}>
            <Icon n="arr" rotate={180} />
          </button>
          <button className="round" type="button" aria-label={u('next')} onClick={() => scrollRail(1)}>
            <Icon n="arr" />
          </button>
        </div>
      </div>
      <ul className="rail" ref={rail}>
        {list.map((p) => (
          <li key={p.id}>
            <a className="pc" href={p.href} target="_blank" rel="noopener" draggable={false} onClick={(e) => gate(e, p.href)}>
              <span className="disc pc__d">
                <img src={p.img} alt="" loading="lazy" width={640} height={640} draggable={false} />
                <i className="pc__i"><Icon n="ne" /></i>
              </span>
              <span className="pc__t">
                <span className="code">{p.code}</span>
                <b>{t(p.name)}</b>
              </span>
              <small>{t(p.cat)}</small>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
