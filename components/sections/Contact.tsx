'use client';

import { useState, type FormEvent } from 'react';
import { useSite } from '../SiteProvider';
import { Icon } from '../Icon';
import { sendSubmission } from '@/lib/submit';

export default function Contact() {
  const { t, lang, content } = useSite();

  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  // Mesaj Supabase'e kaydedilir ve panelde görünür. E-posta uygulaması açılmaz.
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!f.reportValidity()) return;
    const d = new FormData(f);
    setState('sending');
    const ok = await sendSubmission({ name: String(d.get('name')), email: String(d.get('email')), company: String(d.get('company') ?? ''), message: String(d.get('msg')), topic: 'contact', lang });
    if (ok) f.reset();
    setState(ok ? 'ok' : 'err');
  };

  const lines = t('ct.adrv').split('<br>');
  const CONTACT = content.contact;
  const s = CONTACT.social;

  return (
    <section className="contact" id="iletisim">
      <div className="contact__g">
        <div className="contact__l">
          <h2 className="h2">{t('ct.h')}</h2>
          <p className="lead">{t('ct.p')}</p>
          <dl className="info">
            <div><dt>{t('ct.tel')}</dt><dd><a href={CONTACT.telHref}>{CONTACT.tel}</a></dd></div>
            <div><dt>{t('ct.fax')}</dt><dd><a href={CONTACT.faxHref}>{CONTACT.fax}</a></dd></div>
            <div><dt>{t('ct.mail')}</dt><dd>{CONTACT.mail}</dd></div>
            <div>
              <dt>{t('ct.adr')}</dt>
              <dd>
                {lines.map((l, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {l}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <div className="soc">
            <a href={s.instagram} target="_blank" rel="noopener" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.6" r=".7" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href={s.facebook} target="_blank" rel="noopener" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z" /></svg>
            </a>
            <a href={s.x} target="_blank" rel="noopener" aria-label="X">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3L14.2 10.6 22 21h-6.1l-4.8-6.3L5.5 21h-3l7-8.1L2 3h6.2l4.3 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" /></svg>
            </a>
            <a href={s.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h3.8v12H4zM5.9 3a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM10.2 9h3.6v1.7c.5-1 1.8-2 3.8-2 3.9 0 4.6 2.5 4.6 5.8V21h-3.8v-5.7c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21h-3.8z" /></svg>
            </a>
          </div>
        </div>
        <form className="f" onSubmit={onSubmit} noValidate>
          <div className="f2">
            <div className="fld"><input id="fn" name="name" type="text" placeholder=" " required autoComplete="name" /><label htmlFor="fn">{t('f.name')}</label></div>
            <div className="fld"><input id="fc" name="company" type="text" placeholder=" " autoComplete="organization" /><label htmlFor="fc">{t('f.comp')}</label></div>
          </div>
          <div className="fld"><input id="fe" name="email" type="email" placeholder=" " required autoComplete="email" /><label htmlFor="fe">{t('f.mail')}</label></div>
          <div className="fld"><textarea id="fm" name="msg" placeholder=" " required /><label htmlFor="fm">{t('f.msg')}</label></div>
          <div className="f__act">
            <button className="btn" type="submit" disabled={state === 'sending'}>{t('f.send')}</button>
            <p className="f__note" role="status">{state === 'ok' ? t('f.ok') : state === 'err' ? t('f.err') : t('f.note')}</p>
          </div>
        </form>
      </div>
      <div className="map">
        <iframe title="Aras Metal konum" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={CONTACT.map} />
        <a className="pill pill--k map__b" href={CONTACT.directions} target="_blank" rel="noopener">
          <span>{t('ct.dir')}</span>
          <Icon n="ne" />
        </a>
      </div>
    </section>
  );
}
