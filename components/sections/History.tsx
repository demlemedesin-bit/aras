'use client';

import { useSite } from '../SiteProvider';

export default function History() {
  const { t, lang, content } = useSite();
  const items = content.history;
  return (
    <section className="sec hist" id="tarihce">
      <div className="head">
        <h2 className="h2">{t('hist.h')}</h2>
      </div>
      {items.length === 0 ? (
        <p className="hist__empty">{t('hist.empty')}</p>
      ) : (
        <ol className="hl">
          {items.map((h, i) => (
            <li key={h.id} className={i === items.length - 1 ? 'last' : undefined}>
              <span className="hl__y">{h.year}</span>
              <div className="hl__b">
                <b>{h.title[lang] ?? h.title.tr}</b>
                {(h.body[lang] ?? h.body.tr) && <p>{h.body[lang] ?? h.body.tr}</p>}
                {h.img && <img src={h.img} alt="" loading="lazy" width={720} height={480} />}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
