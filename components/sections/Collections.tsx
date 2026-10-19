'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import type { Content } from '@/lib/content';
import type { World } from '@/lib/data';
import { useSite } from '../SiteProvider';
import { Icon } from '../Icon';

const WORLDS: { id: World; key: string }[] = [
  { id: 'all', key: 'f.all' },
  { id: 'home', key: 'tab.home' },
  { id: 'garden', key: 'tab.garden' },
];

export default function Collections() {
  const { t, world, pickWorld, session, openAuth, content } = useSite();
  const [open, setOpen] = useState('kitchen');
  const visible = content.collections.filter((c) => world === 'all' || c.world === world);

  // Filtre değişince açık satır gizlendiyse ilk görünür satırı aç.
  useEffect(() => {
    if (!visible.some((c) => c.id === open)) setOpen(visible[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world]);

  const onClick = (e: MouseEvent, c: Content['collections'][number]) => {
    if (open !== c.id) {
      e.preventDefault();
      setOpen(c.id);
      return;
    }
    if (!session) {
      e.preventDefault();
      openAuth(c.href);
    }
  };

  return (
    <section className="sec cols" id="koleksiyonlar">
      <div className="head">
        <h2 className="h2">{t('col.h')}</h2>
        <div className="seg" role="group">
          {WORLDS.map((w) => (
            <button key={w.id} type="button" aria-pressed={world === w.id} onClick={() => pickWorld(w.id)}>
              {t(w.key)}
            </button>
          ))}
        </div>
      </div>
      <ul className="acc">
        {visible.map((c) => (
          <li key={c.id}>
            <a
              className={`row acc__p${open === c.id ? ' open' : ''}`}
              href={c.href}
              target="_blank"
              rel="noopener"
              onClick={(e) => onClick(e, c)}
              onFocus={() => setOpen(c.id)}
              onMouseEnter={() => {
                if (matchMedia('(hover:hover)').matches) setOpen(c.id);
              }}
            >
              <span className="row__bg" style={{ backgroundImage: `url(${c.img})`, backgroundPosition: c.pos }} />
              <span className="row__bar">
                <span className="row__th" style={{ backgroundImage: `url(${c.img})`, backgroundPosition: c.pos }} />
                <b className="row__n">{t(c.title)}</b>
                <span className="row__m">
                  <span className="chip">{t(c.world === 'garden' ? 'tab.garden' : 'tab.home')}</span>
                  <span className="chip chip--n">
                    {c.count} <span>{t('unit')}</span>
                  </span>
                </span>
                <i className="go"><Icon n="ne" /></i>
              </span>
              <span className="row__d">
                <span>{t(c.desc)}</span>
                {c.subs && (
                  <span className="row__s">
                    {c.subs.map((k) => (
                      <span key={k}>{t(k)}</span>
                    ))}
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
