'use client';
import { useEffect, useState } from 'react';
import { CONSENT_KEY, getConsent } from '@/lib/track';

const TXT: Record<string, { t: string; p: string; a: string; r: string; l: string }> = {
  tr: { t: 'Çerez tercihiniz', p: 'Siteyi geliştirmek ve reklamları ölçmek için anonim ziyaret ve çerez verisi kullanıyoruz. Reddederseniz kalıcı kimlik ve reklam çerezi kullanılmaz.', a: 'Kabul et', r: 'Reddet', l: 'Çerez politikası' },
  en: { t: 'Your cookie choice', p: 'We use anonymous visit data and cookies to improve the site and measure ads. If you decline, no persistent ID or advertising cookies are used.', a: 'Accept', r: 'Decline', l: 'Cookie policy' },
  de: { t: 'Ihre Cookie-Auswahl', p: 'Wir nutzen anonyme Besuchsdaten und Cookies, um die Seite zu verbessern und Werbung zu messen. Bei Ablehnung werden keine dauerhafte ID und keine Werbe-Cookies verwendet.', a: 'Akzeptieren', r: 'Ablehnen', l: 'Cookie-Richtlinie' },
  fr: { t: 'Votre choix de cookies', p: 'Nous utilisons des données de visite anonymes et des cookies pour améliorer le site et mesurer les publicités. En cas de refus, aucun identifiant persistant ni cookie publicitaire n’est utilisé.', a: 'Accepter', r: 'Refuser', l: 'Politique de cookies' },
  es: { t: 'Su preferencia de cookies', p: 'Usamos datos de visita anónimos y cookies para mejorar el sitio y medir anuncios. Si rechaza, no se usan identificadores persistentes ni cookies publicitarias.', a: 'Aceptar', r: 'Rechazar', l: 'Política de cookies' },
  it: { t: 'La tua scelta sui cookie', p: 'Usiamo dati di visita anonimi e cookie per migliorare il sito e misurare gli annunci. Se rifiuti, non vengono usati ID persistenti né cookie pubblicitari.', a: 'Accetta', r: 'Rifiuta', l: 'Cookie policy' },
};

/** Çerez onayı. Seçim tarayıcıda saklanır; sayfa yenilenerek etiketler yüklenir/kaldırılır. */
export default function Consent() {
  const [show, setShow] = useState(false);
  const [lang, setLang] = useState('tr');

  useEffect(() => {
    const read = () => setLang(document.documentElement.lang || 'tr');
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    if (getConsent() === null && !document.cookie.includes('-auth-token')) {
      const tm = setTimeout(() => setShow(true), 1500);
      return () => { clearTimeout(tm); mo.disconnect(); };
    }
    return () => mo.disconnect();
  }, []);

  if (!show) return null;
  const x = TXT[lang] ?? TXT.en;
  const choose = (v: 'all' | 'min') => {
    try { localStorage.setItem(CONSENT_KEY, v); } catch {}
    setShow(false);
    window.dispatchEvent(new Event('aras-consent'));
  };
  return (
    <div className="ck" role="dialog" aria-label={x.t}>
      <b>{x.t}</b>
      <p>{x.p} <a href="/cerez-politikasi">{x.l}</a></p>
      <div className="ck__b">
        <button type="button" className="ck__r" onClick={() => choose('min')}>{x.r}</button>
        <button type="button" className="ck__a" onClick={() => choose('all')}>{x.a}</button>
      </div>
    </div>
  );
}
