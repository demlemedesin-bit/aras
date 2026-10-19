// Ön yüz (localStorage) tabanlı bayi girişi. Gerçek bir yetkilendirme DEĞİLDİR:
// ürün bağlantılarını yalnızca arayüzde kilitler. Gerçek koruma için Supabase Auth'a geçilmeli.

export type Session = { email: string; name: string };
type User = { name: string; company: string; phone: string; salt: string; hash: string; at: number };
type Users = Record<string, User>;

const KU = 'aras-users';
const KS = 'aras-session';
const mem: { users: Users; sess: Session | null } = { users: {}, sess: null };

function rd<T>(k: string, d: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
}
function wr(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* depolama kapalı */
  }
}

export function readSession(): Session | null {
  const s = rd<Session | null>(KS, null);
  const v = s && s.email ? s : mem.sess;
  return v && v.email ? v : null;
}

export function clearSession() {
  mem.sess = null;
  try {
    localStorage.removeItem(KS);
  } catch {
    /* depolama kapalı */
  }
}

async function hash(salt: string, pw: string): Promise<string> {
  const txt = `${salt}|${pw}`;
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381;
  for (let i = 0; i < txt.length; i++) h = ((h << 5) + h + txt.charCodeAt(i)) | 0;
  return `f${(h >>> 0).toString(16)}`;
}

function newSalt(): string {
  const a = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(a);
  else a.forEach((_, i) => (a[i] = Math.random() * 256));
  return Array.from(a, (x) => x.toString(16)).join('');
}

export type AuthResult = { ok: true; session: Session } | { ok: false; err: 'e1' | 'e2' | 'e3' | 'e4' | 'e5' };

export type AuthInput = { mode: 'in' | 'up'; email: string; password: string; name: string; company: string; phone: string };

export async function submitAuth(i: AuthInput): Promise<AuthResult> {
  const em = i.email.trim().toLowerCase();
  const nm = i.name.trim();
  const co = i.company.trim();
  const ph = i.phone.trim();
  if (!em || !i.password || (i.mode === 'up' && (!nm || !co || !ph))) return { ok: false, err: 'e1' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(em)) return { ok: false, err: 'e2' };
  const users = rd<Users>(KU, mem.users);
  let session: Session;
  if (i.mode === 'up') {
    if (i.password.length < 8) return { ok: false, err: 'e3' };
    if (users[em]) return { ok: false, err: 'e4' };
    const salt = newSalt();
    users[em] = { name: nm, company: co, phone: ph, salt, hash: await hash(salt, i.password), at: Date.now() };
    mem.users = users;
    wr(KU, users);
    session = { email: em, name: nm };
  } else {
    const u = users[em];
    if (!u) return { ok: false, err: 'e5' };
    if ((await hash(u.salt, i.password)) !== u.hash) return { ok: false, err: 'e5' };
    session = { email: em, name: u.name };
  }
  mem.sess = session;
  wr(KS, session);
  return { ok: true, session };
}
