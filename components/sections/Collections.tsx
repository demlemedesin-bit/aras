'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import type { World } from '@/lib/data';
import { useSite } from '../SiteProvider';
import { Icon } from '../Icon';
import { track } from '@/lib/track';
import Lightbox, { type LB } from '../Lightbox';
import { catName, resolveCat } from '@/lib/categories';

const WORLDS: { id: World; key: string }[] = [
  { id: 'all', key: 'f.all' },
  { id: 'home', key: 'tab.home' },
  { id: 'garden', key: 'tab.garden' },
];

export default function Collections() {
  const { t, lang, world, pickWorld, openCatalog, session, content } = useSite();
  const [open, setOpen] = useState('kitchen');
  const [lb, setLb] = useState<LB>(null);
  const tree = content.categories;
  const all = tree.map((m) => {
    const old = content.collections.find((c) => c.id === m.id);
    const mine = content.products.filter((p) => resolveCat(tree, p.cat).main?.id === m.id);
    const img = m.img ?? old?.img ?? mine.find((p) => p.img)?.img ?? (m.world === 'garden' ? '/images/col-garden.webp' : '/images/lifestyle-1.webp');
    return {
      id: m.id,
      world: m.world,
      title: catName(m.name, lang),
      desc: old ? t(old.desc) : '',
      count: mine.length || old?.count || 0,
      img,
      pos: old?.pos,
      subs: m.subs.map((x) => ({ id: x.id, name: catName(x.name, lang), img: x.img })),
      photos: (m.photos?.length ? m.photos : m.subs.flatMap((x) => x.photos ?? [])).slice(0, 8),
      groups: [
        ...(m.photos?.length ? [{ name: catName(m.name, lang), photos: m.photos }] : []),
        ...m.subs.filter((x) => x.photos?.length).map((x) => ({ name: catName(x.name, lang), photos: x.photos as string[] })),
      ],
    };
  });
  const visible = all.filter((c) => world === 'all' || c.world === world);

  // Filtre değişince açık satır gizlendiyse ilk görünür satırı aç.
  useEffect(() => {
    if (visible.length && !visible.some((c) => c.id === open)) setOpen(visible[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world]);

  const openLb = (c: (typeof all)[number], n: number): LB => {
    const g = c.groups.length ? c.groups : [{ name: c.title, photos: c.photos }];
    const k = Math.max(0, g.findIndex((x) => x.photos.includes(c.photos[n])));
    return { groups: g, g: k, i: Math.max(0, g[k].photos.indexOf(c.photos[n])), title: c.groups.length > 1 ? c.title : undefined };
  };

  const onClick = (e: MouseEvent, c: (typeof all)[number]) => {
    if (open !== c.id) {
      e.preventDefault();
      setOpen(c.id);
      return;
    }
    e.preventDefault();
    track('event', 'collection_click');
    if (session) location.assign(`/bayi/urunler?k=${c.id}`);
    else openCatalog();
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e as unknown as MouseEvent, c); }}
              onClick={(e) => onClick(e, c)}
              onFocus={() => setOpen(c.id)}
              onMouseEnter={() => {
                if (matchMedia('(hover:hover)').matches) setOpen(c.id);
              }}
            >
              <span className="row__bg" style={{ backgroundImage: `url(${c.img})`, backgroundPosition: c.pos }} />
              <span className="row__bar">
                <span className="row__th" style={{ backgroundImage: `url(${c.img})`, backgroundPosition: c.pos }} />
                <b className="row__n">{c.title}</b>
                <span className="row__m">
                  <span className="chip">{t(c.world === 'garden' ? 'tab.garden' : 'tab.home')}</span>
                  {c.count > 0 && (
                    <span className="chip chip--n">
                      {c.count} <span>{t('unit')}</span>
                    </span>
                  )}
                </span>
                <i className="go"><Icon n="ne" /></i>
              </span>
              <span className="row__d">
                {c.desc && <span>{c.desc}</span>}
                {c.subs.length > 0 && (
                  <span className="row__s">
                    {c.subs.map((k) => (
                      <span key={k.id}>{k.img && <i style={{ backgroundImage: `url(${k.img})` }} />}{k.name}</span>
                    ))}
                  </span>
                )}
                {c.photos.length > 0 && (
                  <span className="row__p">
                    {c.photos.map((u, n) => (
                      <i
                        key={u}
                        role="button"
                        tabIndex={0}
                        aria-label={`${c.title} ${n + 1}`}
                        style={{ backgroundImage: `url(${u})` }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLb(openLb(c, n)); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setLb(openLb(c, n)); } }}
                      />
                    ))}
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <Lightbox lb={lb} set={setLb} cta={session ? { label: t('dp.h'), on: () => location.assign('/bayi/urunler') } : { label: t('dp.login'), on: openCatalog }} />
    </section>
  );
}
