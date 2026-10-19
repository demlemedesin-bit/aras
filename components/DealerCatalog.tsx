'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSite } from './SiteProvider';

export function DealerCatalog({ allowed, company }: { allowed: boolean; company: string }) {
  const { t, world, pickWorld, openAuth, openCatalog, content, session } = useSite();
  const [q, setQ] = useState('');
  const [col, setCol] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('q')) setQ(p.get('q')!);
    if (p.get('k')) setCol(p.get('k')!);
  }, []);
  useEffect(() => {
    if (!allowed && !session) openAuth('/bayi/urunler');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  const colTitle = useMemo(() => Object.fromEntries(content.collections.map((c) => [c.title, c])), [content.collections]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return content.products.filter((p) => {
      if (world !== 'all' && p.world !== world) return false;
      if (col && colTitle[p.cat]?.id !== col) return false;
      return !s || `${p.code} ${t(p.name)} ${t(p.cat)}`.toLowerCase().includes(s);
    });
  }, [content.products, world, col, q, colTitle, t]);

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
        <select value={col} onChange={(e) => setCol(e.target.value)} aria-label={t('col.h')}>
          <option value="">{t('col.h')}</option>
          {content.collections.filter((c) => world === 'all' || c.world === world).map((c) => <option key={c.id} value={c.id}>{t(c.title)}</option>)}
        </select>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('dp.search')} aria-label={t('dp.search')} />
      </div>
      {list.length === 0 ? (
        <p className="hist__empty">{t('dp.empty')}</p>
      ) : (
        <ul className="dp__g">
          {list.map((p) => (
            <li key={p.id}>
              <span className="disc dp__d"><img src={p.img} alt={t(p.name)} loading="lazy" width={480} height={480} /></span>
              <span className="code">{p.code}</span>
              <b>{t(p.name)}</b>
              <small>{t(p.cat)}</small>
              <button className="pill" type="button" onClick={openCatalog}><span>{t('dp.quote')}</span></button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
