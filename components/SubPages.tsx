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
  const base: Record<string, string> = pick(CAREERS, lang);
  const od = resolveDoc(content.pages, 'kariyer', lang);
  const c: Record<string, string> = { ...base, title: od.title, lead: od.lead };
  const [st, setSt] = useState<'idle' | 'busy' | 'ok' | 'err' | 'fill'>('idle');
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const d = new FormData(f);
    const g = (k: string) => String(d.get(k) ?? '').trim();
    if (!g('name') || !g('email') || !g('message')) return setSt('fill');
    setSt('busy');
    const ok = await sendSubmission({ name: g('name'), email: g('email'), phone: g('phone'), message: g('message'), topic: 'career', lang });
    if (ok) f.reset();
    setSt(ok ? 'ok' : 'err');
  }
  return (
    <article className="sub__in">
      <Head title={c.title} lead={c.lead} />
      <form className="sub__f" onSubmit={onSubmit} noValidate>
        <label><span>{c.name}</span><input name="name" autoComplete="name" /></label>
        <label><span>{c.email}</span><input name="email" type="email" autoComplete="email" /></label>
        <label><span>{c.phone}</span><input name="phone" type="tel" autoComplete="tel" /></label>
        <label><span>{c.msg}</span><textarea name="message" rows={5} /></label>
        <p className="auth__err" role="alert">{st === 'fill' ? c.fill : st === 'err' ? c.err : ''}</p>
        {st === 'ok' && <p className="sub__ok" role="status">{c.ok}</p>}
        <button className="btn auth__go" type="submit" disabled={st === 'busy'}>{c.send}</button>
        <small>{c.note}</small>
      </form>
    </article>
  );
}
