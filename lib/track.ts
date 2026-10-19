/** Ölçüm. Panelde oturumu açık personel ve otomasyon tarayıcıları sayılmaz.
 *  Çerez tercihi "Kabul": kalıcı anonim ziyaretçi kodu (tekrar gelen ziyaretçi) + reklam etiketleri.
 *  Çerez tercihi "Reddet": yalnızca günlük dönen anonim kod, kalıcı kimlik yok, reklam etiketi yok. */
export type TrackKind = 'view' | 'event' | 'section' | 'leave';

export const CONSENT_KEY = 'aras-consent';
export type Consent = 'all' | 'min' | null;

const rnd = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');

function skip(): boolean {
  try {
    return typeof window === 'undefined' || navigator.webdriver || document.cookie.includes('-auth-token');
  } catch {
    return true;
  }
}

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'all' || v === 'min' ? v : null;
  } catch {
    return null;
  }
}

function uid(): string | undefined {
  if (getConsent() !== 'all') return undefined;
  try {
    let v = localStorage.getItem('aras-uid');
    if (!v) {
      v = rnd();
      localStorage.setItem('aras-uid', v);
    }
    return v;
  } catch {
    return undefined;
  }
}

function sid(): string {
  try {
    let v = sessionStorage.getItem('aras-sid');
    if (!v) {
      v = rnd();
      sessionStorage.setItem('aras-sid', v);
    }
    return v;
  } catch {
    return 'x' + rnd();
  }
}

type Landing = { ref: string; utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_term?: string; utm_content?: string; click?: string; entry: string };

/** Oturumun ilk girişi: yönlendiren site ve kampanya parametreleri oturum boyunca saklanır. */
export function landing(): { l: Landing; first: boolean } {
  try {
    const raw = sessionStorage.getItem('aras-lp');
    if (raw) return { l: JSON.parse(raw) as Landing, first: false };
  } catch {}
  const q = new URLSearchParams(location.search);
  const g = (k: string) => (q.get(k) || '').slice(0, 80) || undefined;
  const click = q.get('gclid') ? 'gclid' : q.get('fbclid') ? 'fbclid' : q.get('msclkid') ? 'msclkid' : q.get('ttclid') ? 'ttclid' : q.get('li_fat_id') ? 'li' : undefined;
  const l: Landing = { ref: document.referrer || '', utm_source: g('utm_source'), utm_medium: g('utm_medium'), utm_campaign: g('utm_campaign'), utm_term: g('utm_term'), utm_content: g('utm_content'), click, entry: location.pathname };
  try {
    sessionStorage.setItem('aras-lp', JSON.stringify(l));
  } catch {}
  return { l, first: true };
}

function send(body: Record<string, unknown>, beacon = false) {
  const data = JSON.stringify(body);
  try {
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([data], { type: 'application/json' }));
      return;
    }
    fetch('/api/track', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: data }).catch(() => {});
  } catch {
    /* ölçüm hatası siteyi etkilemez */
  }
}

type G = { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; clarity?: (...a: unknown[]) => void };
const LEAD: Record<string, string> = { catalog_submit: 'Lead', contact_submit: 'Contact', dealer_register: 'CompleteRegistration' };
const GA: Record<string, string> = { catalog_submit: 'generate_lead', contact_submit: 'generate_lead', dealer_register: 'sign_up', dealer_login: 'login' };

/** Reklam/analitik etiketleri yüklüyse dönüşümü onlara da bildirir (yalnızca çerez onayıyla). */
function pushConversion(name: string) {
  if (getConsent() !== 'all') return;
  const w = window as unknown as G;
  try {
    w.dataLayer?.push({ event: GA[name] ?? name, aras_event: name });
    if (w.gtag && GA[name]) w.gtag('event', GA[name], { event_category: 'aras' });
    if (w.fbq && LEAD[name]) w.fbq('track', LEAD[name]);
  } catch {}
}

export function track(kind: TrackKind, name?: string, extra: Record<string, unknown> = {}) {
  if (skip()) return;
  const { l, first } = landing();
  send({
    kind,
    name,
    path: location.pathname,
    lang: document.documentElement.lang,
    sid: sid(),
    uid: uid(),
    ref: kind === 'view' ? l.ref : '',
    title: kind === 'view' ? document.title.slice(0, 140) : undefined,
    screen: kind === 'view' ? `${screen.width}x${screen.height}` : undefined,
    utm: kind === 'view' ? { s: l.utm_source, m: l.utm_medium, c: l.utm_campaign, t: l.utm_term, n: l.utm_content, k: l.click } : undefined,
    entry: kind === 'view' ? first : undefined,
    ...extra,
  }, kind === 'leave');
  if (kind === 'event' && name) pushConversion(name);
}
