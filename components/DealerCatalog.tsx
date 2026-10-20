'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useSite } from './SiteProvider';
import Lightbox, { type LB } from './Lightbox';
import { catName, resolveCat } from '@/lib/categories';
import { sendSubmission } from '@/lib/submit';
import type { Price } from '@/lib/dealer-server';

type Props = { allowed: boolean; company: string; name?: string; email?: string; phone?: string; prices?: Record<string, Price> };
type Line = { id: string; qty: number };
const KEY = 'aras-quote';

const Plus = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
const Check = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
const Search = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>;

export function DealerCatalog({ allowed, company, name = '', email = '', phone = '', prices = {} }: Props) {
  const { t, lang, world, pickWorld, openAuth, content, session } = useSite();
  const tree = content.categories;
  const [q, setQ] = useState('');
  const [main, setMain] = useState('');
  const [sub, setSub] = useState('');
  const [lb, setLb] = useState<LB>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [dlg, setDlg] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('q')) setQ(p.get('q')!);
    if (p.get('k')) setMain(p.get('k')!);
    if (p.get('s')) setSub(p.get('s')!);
    try { const r = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(r)) setLines(r.filter((x) => x && typeof x.id === 'string').slice(0, 200)); } catch { /* depolama kapalı */ }
  }, []);
  useEffect(() => {
    if (!allowed && !session) openAuth('/bayi/urunler');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  const save = useCallback((l: Line[]) => { setLines(l); try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* depolama kapalı */ } }, []);
  const has = (id: string) => lines.some((x) => x.id === id);
  const toggle = (id: string) => save(has(id) ? lines.filter((x) => x.id !== id) : [...lines, { id, qty: 1 }]);

  const items = useMemo(() => content.products.map((p) => ({ p, c: resolveCat(tree, p.cat) })), [content.products, tree]);
  const count = (m: string, s?: string) => items.filter((x) => x.c.main?.id === m && (!s || x.c.sub?.id === s)).length;
  const mains = tree.filter((m) => world === 'all' || m.world === world);
  const cat = tree.find((m) => m.id === main);
  const catSub = cat?.subs.find((x) => x.id === sub);

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

  const photos = (catSub?.photos?.length ? catSub.photos : cat?.photos?.length ? cat.photos : cat?.subs.flatMap((x) => x.photos ?? []) ?? []).slice(0, 9);
  const capName = catSub ? catName(catSub.name, lang) : cat ? catName(cat.name, lang) : '';
  const pick = (m: string, s = '') => { setMain(m); setSub(s); };
  const subTotal = tree.reduce((n, m) => n + m.subs.length, 0);

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

  const first = (name || session?.name || '').split(' ')[0];
  const picked = lines.map((l) => ({ l, p: content.products.find((x) => x.id === l.id) })).filter((x): x is { l: Line; p: (typeof content.products)[number] } => !!x.p);
  const totalQty = picked.reduce((n, x) => n + x.l.qty, 0);

  return (
    <article className="dc">
      <header className="dc__hero">
        <div className="dc__hl">
          <p className="dc__hi">{t('dp.hi')}{first ? `, ${first}` : ''}</p>
          <h1>{company || t('dp.h')}</h1>
          <p>{t('dp.sub')}</p>
        </div>
        <dl className="dc__st">
          <div><dt>{t('dp.s.p')}</dt><dd>{content.products.length}</dd></div>
          <div><dt>{t('dp.s.c')}</dt><dd>{tree.length}</dd></div>
          <div><dt>{t('dp.s.k')}</dt><dd>{subTotal}</dd></div>
        </dl>
      </header>

      <div className="dc__stick">
      <div className="dc__bar">
        <div className="seg" role="group">
          {(['all', 'home', 'garden'] as const).map((w) => (
            <button key={w} type="button" aria-pressed={world === w} onClick={() => { pickWorld(w); pick(''); }}>{t(w === 'all' ? 'f.all' : w === 'home' ? 'tab.home' : 'tab.garden')}</button>
          ))}
        </div>
        <label className="dc__q"><Search /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('dp.search')} aria-label={t('dp.search')} /></label>
      </div>

      <div className="dc__chips" role="tablist" aria-label={t('col.h')}>
        <button type="button" role="tab" aria-selected={!main} className={!main ? 'on' : ''} onClick={() => pick('')}>{t('f.all')}<em>{content.products.length}</em></button>
        {mains.map((m) => <button key={m.id} type="button" role="tab" aria-selected={main === m.id} className={main === m.id ? 'on' : ''} onClick={() => pick(m.id)}>{catName(m.name, lang)}<em>{count(m.id)}</em></button>)}
      </div>
      {cat && cat.subs.length > 0 && (
        <div className="dc__chips dc__chips--s">
          <button type="button" className={!sub ? 'on' : ''} onClick={() => pick(cat.id)}>{t('f.all')}</button>
          {cat.subs.map((s) => <button key={s.id} type="button" className={sub === s.id ? 'on' : ''} onClick={() => pick(cat.id, s.id)}>{catName(s.name, lang)}<em>{count(cat.id, s.id)}</em></button>)}
        </div>
      )}
      </div>

      {photos.length > 0 && (
        <section className="dc__ph" aria-label={capName}>
          {photos.slice(0, 5).map((u, n) => (
            <button key={u} type="button" className={n === 0 ? 'big' : ''} onClick={() => setLb({ groups: [{ name: capName, photos }], g: 0, i: n })} aria-label={`${capName} ${n + 1}`}>
              <img src={u} alt="" loading="lazy" />
              {n === 4 && photos.length > 5 && <span>+{photos.length - 5}</span>}
            </button>
          ))}
        </section>
      )}

      <div className="dc__meta"><b>{capName || t('f.all')}</b><span>{list.length} {t('dp.res')}</span></div>

      {list.length === 0 ? (
        <p className="dc__empty">{t('dp.empty')}</p>
      ) : (
        <ul className="dc__g">
          {list.map(({ p, c }) => {
            const on = has(p.id);
            return (
              <li key={p.id} className={on ? 'on' : ''}>
                <div className="dc__im">
                  {p.img ? <img src={p.img} alt={t(p.name)} loading="lazy" width={480} height={480} /> : <span>{p.code}</span>}
                  <i className="dc__code">{p.code}</i>
                  <button type="button" className="dc__add" aria-pressed={on} aria-label={on ? t('dp.in') : t('dp.add')} title={on ? t('dp.in') : t('dp.add')} onClick={() => toggle(p.id)}>{on ? <Check /> : <Plus />}</button>
                </div>
                <b>{t(p.name)}</b>
                <PriceTag pr={prices[p.id]} />
                <small>{c.sub ? `${catName(c.main!.name, lang)} › ${catName(c.sub.name, lang)}` : c.main ? catName(c.main.name, lang) : t(p.cat)}</small>
              </li>
            );
          })}
        </ul>
      )}

      {picked.length > 0 && (
        <div className="dc__fab">
          <span className="dc__stack">{picked.slice(0, 3).map(({ p }) => <i key={p.id} style={p.img ? { backgroundImage: `url(${p.img})` } : undefined} />)}</span>
          <span className="dc__fabt"><b>{picked.length} {t('dp.n')}</b><small>{totalQty} {t('dp.qty').toLowerCase()}</small></span>
          <button type="button" onClick={() => setDlg(true)}>{t('dp.quote')}</button>
        </div>
      )}

      {dlg && <QuoteDialog picked={picked} onClose={() => setDlg(false)} onQty={(id, qty) => save(lines.map((x) => (x.id === id ? { ...x, qty } : x)))} onRemove={(id) => save(lines.filter((x) => x.id !== id))} onSent={() => save([])} prices={prices} company={company} name={name || session?.name || ''} email={email || session?.email || ''} phone={phone} />}
      <Lightbox lb={lb} set={setLb} />
    </article>
  );
}

const SYM: Record<string, string> = { TRY: '₺', USD: '$', EUR: '€' };
const money = (n: number, c: string) => `${n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${SYM[c] ?? c}`;
const STOCK: Record<string, [string, string]> = { in: ['Stokta', 'in'], low: ['Sınırlı stok', 'low'], out: ['Tükendi', 'out'], order: ['Siparişle', 'order'] };

function PriceTag({ pr }: { pr?: Price }) {
  if (!pr) return null;
  const st = STOCK[pr.stock] ?? STOCK.in;
  return (
    <span className="dc__pr">
      {pr.price != null && <strong>{money(pr.price, pr.currency)}<small> / {pr.unit}</small></strong>}
      <em className={`dc__stk dc__stk--${st[1]}`}>{st[0]}</em>
      {pr.min_qty ? <small>Min. {pr.min_qty} {pr.unit}</small> : null}
    </span>
  );
}

function QuoteDialog({ picked, onClose, onQty, onRemove, onSent, prices, company, name, email, phone }: {
  picked: { l: Line; p: { id: string; code: string; name: string; img: string } }[];
  prices: Record<string, Price>;
  onClose: () => void; onQty: (id: string, q: number) => void; onRemove: (id: string) => void; onSent: () => void;
  company: string; name: string; email: string; phone: string;
}) {
  const { t, lang } = useSite();
  const [st, setSt] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle');
  const [ph, setPh] = useState(phone);
  const [note, setNote] = useState('');
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k);
    const o = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = o; };
  }, [onClose]);

  const totals = picked.reduce<Record<string, number>>((a, { l, p }) => { const pr = prices[p.id]; if (pr?.price != null) a[pr.currency] = (a[pr.currency] ?? 0) + pr.price * l.qty; return a; }, {});
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!picked.length) return;
    setSt('busy');
    const rows = picked.map(({ l, p }) => `• ${p.code} — ${t(p.name)} × ${l.qty}`).join('\n');
    const message = `Bayi teklif talebi (${picked.length} ürün)\n${rows}${note.trim() ? `\n\nNot: ${note.trim()}` : ''}`;
    const items = picked.map(({ l, p }) => ({ id: p.id, code: p.code, name: t(p.name), qty: l.qty, price: prices[p.id]?.price ?? null, currency: prices[p.id]?.currency }));
    const ok = await sendSubmission({ name, email, company, phone: ph, message, topic: 'catalog', lang, items });
    setSt(ok ? 'ok' : 'err');
    if (ok) onSent();
  }

  return createPortal(
    <div className="qd" role="dialog" aria-modal="true" aria-label={t('dp.list')} onClick={onClose}>
      <div className="qd__box" onClick={(e) => e.stopPropagation()}>
        <button className="qd__x" type="button" aria-label={t('dp.close')} onClick={onClose}>×</button>
        {st === 'ok' ? (
          <div className="qd__ok">
            <span><Check /></span>
            <h2>{t('dp.okh')}</h2>
            <p>{t('dp.okp')}</p>
            <button className="btn" type="button" onClick={onClose}>{t('dp.done')}</button>
          </div>
        ) : (
          <>
            <div className="qd__l">
              <h2>{t('dp.list')}</h2>
              <ul>
                {picked.map(({ l, p }) => (
                  <li key={p.id}>
                    <span className="qd__im" style={p.img ? { backgroundImage: `url(${p.img})` } : undefined} />
                    <span className="qd__n"><b>{t(p.name)}</b><small>{p.code}{prices[p.id]?.price != null ? ` · ${money(prices[p.id].price as number, prices[p.id].currency)} × ${l.qty}` : ''}</small></span>
                    <span className="qd__q">
                      <button type="button" aria-label="−" onClick={() => (l.qty > 1 ? onQty(p.id, l.qty - 1) : onRemove(p.id))}>−</button>
                      <input inputMode="numeric" value={l.qty} aria-label={t('dp.qty')} onChange={(e) => onQty(p.id, Math.max(1, Math.min(99999, parseInt(e.target.value.replace(/\D/g, '')) || 1)))} />
                      <button type="button" aria-label="+" onClick={() => onQty(p.id, Math.min(99999, l.qty + 1))}>+</button>
                    </span>
                    <button type="button" className="qd__rm" aria-label={t('dp.clear')} onClick={() => onRemove(p.id)}>×</button>
                  </li>
                ))}
              </ul>
              {Object.keys(totals).length > 0 && <p className="qd__tot"><span>Tahmini toplam</span><b>{Object.entries(totals).map(([c, v]) => money(v, c)).join(' + ')}</b><small>KDV hariç, bilgi amaçlıdır. Kesin teklif size iletilir.</small></p>}
            </div>
            <form className="qd__f" onSubmit={submit}>
              <div className="qd__who">
                <b>{company || name}</b>
                <small>{name}{name && email ? ' · ' : ''}{email}</small>
              </div>
              <label><span>{t('dp.phone')}</span><input value={ph} onChange={(e) => setPh(e.target.value)} type="tel" autoComplete="tel" /></label>
              <label><span>{t('dp.note')}</span><textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} /></label>
              {st === 'err' && <p className="auth__err" role="alert">{t('dp.err')}</p>}
              <button className="btn auth__go" type="submit" disabled={st === 'busy' || !picked.length}>{t('dp.send')}</button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
