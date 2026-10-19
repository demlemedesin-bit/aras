import { NextResponse } from 'next/server';
import { COOKIE, checkPw, cookieOpts, findByEmail, ipOf, limited, makeToken, touchLogin } from '@/lib/dealer-server';

export const runtime = 'nodejs';
const out = (err: string, status = 400) => NextResponse.json({ ok: false, err }, { status });

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const email = String(b.email ?? '').trim().toLowerCase().slice(0, 200);
  const pw = String(b.password ?? '').slice(0, 200);
  if (!email || !pw) return out('e1');
  if (limited(`giris:${ipOf(req)}`, 10, 900_000) || limited(`giris:${email}`, 8, 900_000)) return out('e8', 429);
  try {
    const d = await findByEmail(email);
    // Kullanıcı yoksa da hash hesaplanır; böylece yanıt süresinden hesap varlığı anlaşılmaz.
    const ok = d ? await checkPw(pw, d.pw_hash) : (await checkPw(pw, 's1$00$00'), false);
    if (!d || !ok) return out('e5', 401);
    if (d.status === 'pending') return out('e6', 403);
    if (d.status === 'rejected') return out('e7', 403);
    void touchLogin(d.id);
    const res = NextResponse.json({ ok: true, session: { email: d.email, name: d.name } });
    res.cookies.set(COOKIE, makeToken(d.id), cookieOpts());
    return res;
  } catch {
    return out('e8', 500);
  }
}
