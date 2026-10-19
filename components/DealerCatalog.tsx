'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSite } from './SiteProvider';
import { catName, resolveCat } from '@/lib/categories';

export function DealerCatalog({ allowed, company }: { allowed: boolean; company: string }) {
  const { t, lang, world, pickWorld, openAuth, openCatalog, content, session } = useSite();
  const tree = content.categories;
  const [q, setQ] = useState('');
  const [main, setMain] = useState('');
  const [sub, setSub] = useState('');
  const [openNav, setOpenNav] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('q')) setQ(p.get('q')!);
    if (p.get('k')) setMain(p.get('k')!);
    if (p.get('s')) { setSub(p.get('s')!); }
  }, []);
  useEffect(() => {
    if (!allowed && !session) openAuth('/bayi/urunler');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  const items = useMemo(() => content.products.map((p) => ({ p, c: resolveCat(tree, p.cat) })), [content.products, tree]);
  const count = (m: string, s?: string) => items.filter((x) => x.c.main?.id === m && (!s || x.c.sub?.id === s)).length;

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter(({ p, c }) => {
      if (world !== 'all' && p.world !== world) return false;
      if (main && c.main?.id !== main) return false;
      if (sub && c.sub?.id !== sub) return false;
      const label = c.sub ? catName(c.sub.name, lang) : c.main ? catName(c.main.name, lang) : t(p.cat);
      return !s || `${p.code} ${t(p.name)} ${label}`.toLowerCase().includes(s);
    });
  }, [items, world, main, sub, q, lang, t]);

  const cat = tree.find((m) => m.id === main);
  const catSub = cat?.subs.find((x) => x.id === sub);
  const photos = (catSub?.photos?.length ? catSub.photos : cat?.photos?.length ? cat.photos : cat?.subs.flatMap((x) => x.photos ?? []) ?? []).slice(0, 12);

  const pick = (m: string, s = '') => { setMain(m); setSub(s); setOpenNav(false); };

  if (!allowed) {
    return (
      <article className="sub__in">
        <div className="sub__h">
          <h1 className="h2">{t('dp.h')}</h1>
          <p className="lead">{t('dp.gate')}</p>
        </div>
        <button className="btn auth__go" type="button" onClick={() => openAuth('/bayi/urunler')}>{t('dp.login')}</button>
      </article>
    );
  }

  return (
    <article className="sub__in dp">
      <div className="sub__h">
        <h1 className="h2">{t('dp.h')}</h1>
        <p className="lead">{company ? `${company} · ` : ''}{t('dp.p')}</p>
      </div>
      <div className="dp__bar">
        <div className="seg" role="group">
          {(['all', 'home', 'garden'] as const).map((w) => (
            <button key={w} type="button" aria-pressed={world === w} onClick={() => pickWorld(w)}>{t(w === 'all' ? 'f.all' : w === 'home' ? 'tab.home' : 'tab.garden')}</button>
          ))}
        </div>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('dp.search')} aria-label={t('dp.search')} />
        <button className="pill dp__tg" type="button" aria-expanded={openNav} onClick={() => setOpenNav((v) => !v)}><span>{t('col.h')}</span></button>
      </div>
      <div className="dp__wrap">
        <nav className={`dp__nav${openNav ? ' open' : ''}`} aria-label={t('col.h')}>
          <button type="button" className={!main ? 'on' : undefined} onClick={() => pick('')}>{t('f.all')} <em>{content.products.length}</em></button>
          {tree.filter((m) => world === 'all' || m.world === world).map((m) => (
            <div key={m.id}>
              <button type="button" className={main === m.id && !sub ? 'on' : undefined} onClick={() => pick(m.id)}>{catName(m.name, lang)} <em>{count(m.id)}</em></button>
              {main === m.id && m.subs.length > 0 && (
                <ul>
                  {m.subs.map((s) => (
                    <li key={s.id}><button type="button" className={sub === s.id ? 'on' : undefined} onClick={() => pick(m.id, s.id)}>{catName(s.name, lang)} <em>{count(m.id, s.id)}</em></button></li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
        <div className="dp__main">
          {photos.length > 0 && (
            <>
              <p className="dp__cap">{catSub ? catName(catSub.name, lang) : cat ? catName(cat.name, lang) : ''}</p>
              <ul className="dp__ph">
                {photos.map((u) => <li key={u} onClick={openCatalog}><img src={u} alt="" loading="lazy" /></li>)}
              </ul>
            </>
          )}
          {list.length === 0 ? (
            photos.length === 0 && <p className="hist__empty">{t('dp.empty')}</p>
          ) : (
            <ul className="dp__g">
              {list.map(({ p, c }) => (
                <li key={p.id}>
                  <span className="disc dp__d">{p.img ? <img src={p.img} alt={t(p.name)} loading="lazy" width={480} height={480} /> : <span className="dp__noimg">{p.code}</span>}</span>
                  <span className="code">{p.code}</span>
                  <b>{t(p.name)}</b>
                  <small>{c.sub ? `${catName(c.main!.name, lang)} › ${catName(c.sub.name, lang)}` : c.main ? catName(c.main.name, lang) : t(p.cat)}</small>
                  <button className="pill" type="button" onClick={openCatalog}><span>{t('dp.quote')}</span></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
