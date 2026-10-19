'use client';

import { useState, type FormEvent } from 'react';
import { useSite } from './SiteProvider';
import { sendSubmission } from '@/lib/submit';
import { CAREERS, pick } from '@/lib/pages';
import { resolveDoc, type PageSlug } from '@/lib/page-docs';

function Head({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="sub__h">
      <h1 className="h2">{title}</h1>
      <p className="lead">{lead}</p>
    </div>
  );
}

export function Doc({ slug }: { slug: 'gizlilik' | 'cerez-politikasi' | 'kullanim-kosullari' }) {
  const { lang, content } = useSite();
  const d = resolveDoc(content.pages, slug, lang);
  return (
    <article className="sub__in">
      <Head title={d.title} lead={d.lead} />
      {d.blocks.map((b, i) => (
        <section key={i} className="sub__b">
          {b.h && <h2 className="h4">{b.h}</h2>}
          {b.p?.map((x, j) => <p key={j}>{x}</p>)}
          {b.ul && <ul>{b.ul.map((x, j) => <li key={j}>{x}</li>)}</ul>}
        </section>
      ))}
    </article>
  );
}
export const Privacy = () => <Doc slug="gizlilik" />;
export const Cookies = () => <Doc slug="cerez-politikasi" />;
export const Terms = () => <Doc slug="kullanim-kosullari" />;

export function Faq() {
  const { lang, content } = useSite();
  const d = resolveDoc(content.pages, 'sss' as PageSlug, lang);
  return (
    <article className="sub__in">
      <Head title={d.title} lead={d.lead} />
      <div className="faq">
        {d.blocks.map((f, i) => (
          <details key={i}>
            <summary>{f.h}</summary>
            {f.p?.map((x, j) => <p key={j}>{x}</p>)}
          </details>
        ))}
      </div>
    </article>
  );
}

export function Careers() {
  const { lang, content } = useSite();
  const cfg = content.careers;
  const base: Record<string, string> = pick(CAREERS, lang);
  const od = resolveDoc(content.pages, 'kariyer', lang);
  const lb = (k: 'name' | 'email' | 'phone' | 'msg' | 'send' | 'position' | 'open', d: string) => cfg.labels[k]?.[lang]?.trim() || cfg.labels[k]?.tr?.trim() || d;
  const c: Record<string, string> = { ...base, title: od.title, lead: od.lead };
  const nm = (o: Record<string, string | undefined> | undefined) => o?.[lang]?.trim() || o?.tr?.trim() || '';
  const open = cfg.positions.filter((x) => x.active);
  const [st, setSt] = useState<'idle' | 'busy' | 'ok' | 'err' | 'fill'>('idle');
  const [pos, setPos] = useState('');
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const d = new FormData(f);
    const g = (k: string) => String(d.get(k) ?? '').trim();
    if (!g('name') || !g('email')) return setSt('fill');
    if (cfg.message.required && !g('message')) return setSt('fill');
    if (cfg.phone.show && cfg.phone.required && !g('phone')) return setSt('fill');
    for (const x of cfg.extra) if (x.required && !g('x_' + x.id)) return setSt('fill');
    setSt('busy');
    const head = [pos ? `[${lb('position', 'Pozisyon')}: ${pos}]` : '', ...cfg.extra.map((x) => (g('x_' + x.id) ? `${nm(x.label)}: ${g('x_' + x.id)}` : ''))].filter(Boolean).join('\n');
    const message = [head, g('message')].filter(Boolean).join('\n\n') || '-';
    const ok = await sendSubmission({ name: g('name'), email: g('email'), phone: g('phone'), message, topic: 'career', lang });
    if (ok) { f.reset(); setPos(''); }
    setSt(ok ? 'ok' : 'err');
  }
  return (
    <article className="sub__in">
      <Head title={c.title} lead={c.lead} />
      {open.length > 0 && (
        <section className="car__l" aria-label={lb('open', 'Açık pozisyonlar')}>
          <h2 className="h4">{lb('open', 'Açık pozisyonlar')}</h2>
          <ul>
            {open.map((x) => (
              <li key={x.id} className={pos === nm(x.title) ? 'on' : ''}>
                <div>
                  <b>{nm(x.title)}</b>
                  <small>{[nm(x.place), nm(x.type)].filter(Boolean).join(' · ')}</small>
                  {nm(x.desc) && <p>{nm(x.desc)}</p>}
                </div>
                <button type="button" className="btn btn--line" onClick={() => { setPos(nm(x.title)); document.getElementById('kariyer-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{c.send}</button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <form id="kariyer-form" className="sub__f" onSubmit={onSubmit} noValidate>
        {open.length > 0 && (
          <label><span>{lb('position', 'Pozisyon')}</span>
            <select value={pos} onChange={(e) => setPos(e.target.value)}>
              <option value="">—</option>
              {open.map((x) => <option key={x.id} value={nm(x.title)}>{nm(x.title)}</option>)}
            </select>
          </label>
        )}
        <label><span>{lb('name', c.name)}</span><input name="name" autoComplete="name" /></label>
        <label><span>{lb('email', c.email)}</span><input name="email" type="email" autoComplete="email" /></label>
        {cfg.phone.show && <label><span>{lb('phone', c.phone)}{cfg.phone.required ? ' *' : ''}</span><input name="phone" type="tel" autoComplete="tel" /></label>}
        {cfg.extra.map((x) => <label key={x.id}><span>{nm(x.label)}{x.required ? ' *' : ''}</span><input name={'x_' + x.id} /></label>)}
        <label><span>{lb('msg', c.msg)}</span><textarea name="message" rows={5} /></label>
        <p className="auth__err" role="alert">{st === 'fill' ? c.fill : st === 'err' ? c.err : ''}</p>
        {st === 'ok' && <p className="sub__ok" role="status">{c.ok}</p>}
        <button className="btn auth__go" type="submit" disabled={st === 'busy'}>{lb('send', c.send)}</button>
        <small>{c.note}</small>
      </form>
    </article>
  );
}
