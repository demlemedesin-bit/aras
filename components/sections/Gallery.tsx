'use client';

import { useEffect, useRef, useState } from 'react';
import type { Content } from '@/lib/content';
import { useSite } from '../SiteProvider';
import { Icon } from '../Icon';

export default function Gallery() {
  const { t, u, content } = useSite();
  const [group, setGroup] = useState<string>('all');
  const [lb, setLb] = useState<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const list = group === 'all' ? content.gallery : content.gallery.filter((i) => i.group === group);
  const alt = (i: Content['gallery'][number]) => `${t(i.label)} ${i.n}`;

  const close = () => {
    setLb(null);
    trigger.current?.focus();
  };
  const step = (d: number) => setLb((i) => (i === null ? i : (i + d + list.length) % list.length));

  useEffect(() => {
    document.documentElement.classList.toggle('lb-open', lb !== null);
    if (lb === null) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lb === null, list.length]);

  const cur = lb !== null ? list[lb] : null;

  return (
    <section className="sec gal" id="galeri">
      <div className="head">
        <h2 className="h2">{t('gal.h')}</h2>
      </div>
      <div className="gal__tabs" role="group">
        <button className="gal__tab" type="button" aria-pressed={group === 'all'} onClick={() => setGroup('all')}>
          {t('f.all')} <small>{content.gallery.length}</small>
        </button>
        {content.galleryGroups.map((g) => (
          <button key={g.id} className="gal__tab" type="button" aria-pressed={group === g.id} onClick={() => setGroup(g.id)}>
            {t(g.label)} <small>{content.gallery.filter((i) => i.group === g.id).length}</small>
          </button>
        ))}
      </div>
      <ul className="gal__g">
        {list.map((img, i) => (
          <li key={img.src}>
            <button
              className="gal__i"
              type="button"
              aria-label={alt(img)}
              onClick={(e) => {
                trigger.current = e.currentTarget;
                setLb(i);
              }}
            >
              <img src={img.src} alt={alt(img)} loading="lazy" width={1000} height={1250} />
            </button>
          </li>
        ))}
      </ul>

      <div className={`lb${cur ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label={t('gal.h')} aria-hidden={!cur}>
        <div className="lb__scrim" onClick={close} />
        {cur && <img className="lb__img" src={cur.src} alt={alt(cur)} />}
        <button className="lb__x round round--w" ref={closeBtn} type="button" aria-label={u('close')} onClick={close}>
          <Icon n="x" />
        </button>
        <button className="lb__p round round--w" type="button" aria-label={u('prev')} onClick={() => step(-1)}>
          <Icon n="arr" rotate={180} />
        </button>
        <button className="lb__n round round--w" type="button" aria-label={u('next')} onClick={() => step(1)}>
          <Icon n="arr" />
        </button>
        {cur && <span className="lb__c">{(lb ?? 0) + 1} / {list.length}</span>}
      </div>
    </section>
  );
}
