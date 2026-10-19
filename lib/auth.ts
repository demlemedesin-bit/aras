// Bayi girişi: kayıt ve oturum sunucuda (Supabase + imzalı httpOnly çerez) tutulur.
export type Session = { email: string; name: string };
export type AuthErr = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7' | 'e8';
export type AuthResult = { ok: true; session: Session | null; pending?: boolean } | { ok: false; err: AuthErr };
export type AuthInput = { mode: 'in' | 'up'; email: string; password: string; name: string; company: string; phone: string; lang?: string };

export async function readSession(): Promise<Session | null> {
  try {
    const r = await fetch('/api/bayi/oturum', { cache: 'no-store', credentials: 'same-origin' });
    if (!r.ok) return null;
    return ((await r.json()) as { session: Session | null }).session ?? null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  try {
    await fetch('/api/bayi/cikis', { method: 'POST', credentials: 'same-origin' });
  } catch {
    /* ağ yok */
  }
}

export async function submitAuth(i: AuthInput): Promise<AuthResult> {
  const em = i.email.trim().toLowerCase();
  if (!em || !i.password || (i.mode === 'up' && (!i.name.trim() || !i.company.trim() || !i.phone.trim()))) return { ok: false, err: 'e1' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(em)) return { ok: false, err: 'e2' };
  if (i.mode === 'up' && i.password.length < 8) return { ok: false, err: 'e3' };
  try {
    const r = await fetch(i.mode === 'up' ? '/api/bayi/kayit' : '/api/bayi/giris', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: em, password: i.password, name: i.name, company: i.company, phone: i.phone, lang: i.lang }),
    });
    const d = await r.json().catch(() => ({}));
    if (!d.ok) return { ok: false, err: (d.err as AuthErr) || 'e8' };
    return { ok: true, session: d.session ?? null, pending: d.status === 'pending' };
  } catch {
    return { ok: false, err: 'e8' };
  }
}
