import { createHmac, randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { cookies } from 'next/headers';

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const COOKIE = 'aras_dealer';
const TTL = 60 * 60 * 24 * 30; // 30 gün

const H = (x: Record<string, string> = {}) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...x });
const T = `${URL_}/rest/v1/site_dealers`;

export type Dealer = { id: string; email: string; name: string; company: string; phone: string; pw_hash: string; status: 'pending' | 'approved' | 'rejected' };

export async function hashPw(pw: string) {
  const salt = randomBytes(16);
  const k = await scrypt(pw, salt, 64);
  return `s1$${salt.toString('hex')}$${k.toString('hex')}`;
}
export async function checkPw(pw: string, stored: string) {
  const [v, s, k] = stored.split('$');
  if (v !== 's1' || !s || !k) return false;
  const a = await scrypt(pw, Buffer.from(s, 'hex'), 64);
  const b = Buffer.from(k, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

const sign = (p: string) => createHmac('sha256', `dealer|${KEY}`).update(p).digest('base64url');
export const makeToken = (id: string) => {
  const p = `${id}.${Math.floor(Date.now() / 1000) + TTL}`;
  return `${p}.${sign(p)}`;
};
function readToken(t?: string): string | null {
  if (!t) return null;
  const i = t.lastIndexOf('.');
  const p = t.slice(0, i);
  const s = t.slice(i + 1);
  const ok = sign(p);
  if (s.length !== ok.length || !timingSafeEqual(Buffer.from(s), Buffer.from(ok))) return null;
  const [id, exp] = p.split('.');
  return Number(exp) > Date.now() / 1000 ? id : null;
}

export const cookieOpts = (maxAge = TTL) => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge });

export async function findByEmail(email: string): Promise<Dealer | null> {
  const r = await fetch(`${T}?select=*&email=ilike.${encodeURIComponent(email.replace(/[%*_]/g, ''))}&limit=1`, { headers: H(), cache: 'no-store' });
  if (!r.ok) throw new Error('db');
  return ((await r.json()) as Dealer[])[0] ?? null;
}
export async function findById(id: string): Promise<Dealer | null> {
  const r = await fetch(`${T}?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, { headers: H(), cache: 'no-store' });
  if (!r.ok) throw new Error('db');
  return ((await r.json()) as Dealer[])[0] ?? null;
}
export async function insertDealer(row: Record<string, unknown>) {
  return fetch(T, { method: 'POST', headers: H({ Prefer: 'return=minimal' }), body: JSON.stringify(row) });
}
export async function touchLogin(id: string) {
  await fetch(`${T}?id=eq.${id}`, { method: 'PATCH', headers: H(), body: JSON.stringify({ last_login: new Date().toISOString() }) }).catch(() => {});
}
export async function autoApprove(): Promise<boolean> {
  try {
    const r = await fetch(`${URL_}/rest/v1/site_settings?select=value&key=eq.dealers`, { headers: H(), cache: 'no-store' });
    const v = (await r.json())?.[0]?.value;
    return v?.auto_approve === true;
  } catch {
    return false;
  }
}

/** Çerezdeki oturumun sahibi onaylı bayi mi? Her istekte veritabanından doğrulanır. */
export async function currentDealer(): Promise<Dealer | null> {
  const id = readToken((await cookies()).get(COOKIE)?.value);
  if (!id) return null;
  try {
    const d = await findById(id);
    return d && d.status === 'approved' ? d : null;
  } catch {
    return null;
  }
}

// Basit bellek içi hız sınırı (instance başına).
const tries = new Map<string, { n: number; t: number }>();
export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const e = tries.get(key);
  if (!e || now - e.t > windowMs) { tries.set(key, { n: 1, t: now }); if (tries.size > 5000) tries.clear(); return false; }
  e.n++;
  return e.n > max;
}
export const ipOf = (req: Request) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
