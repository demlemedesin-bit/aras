/** Çerezsiz ölçüm. Panelde oturumu açık personel ve otomasyon tarayıcıları sayılmaz. */
export type TrackKind = 'view' | 'event' | 'section';

function skip(): boolean {
  try {
    return typeof window === 'undefined' || navigator.webdriver || document.cookie.includes('-auth-token');
  } catch {
    return true;
  }
}

export function track(kind: TrackKind, name?: string) {
  if (skip()) return;
  try {
    fetch('/api/track', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, name, path: location.pathname, ref: kind === 'view' ? document.referrer : '', lang: document.documentElement.lang }),
    }).catch(() => {});
  } catch {
    /* ölçüm hatası siteyi etkilemez */
  }
}
