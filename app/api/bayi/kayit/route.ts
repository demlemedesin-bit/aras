import { NextResponse } from 'next/server';
import { COOKIE, EMAIL_RE, autoApprove, cookieOpts, findByEmail, hashPw, insertDealer, ipOf, limited, makeToken } from '@/lib/dealer-server';

export const runtime = 'nodejs';
const out = (err: string, status = 400) => NextResponse.json({ ok: false, err }, { status });

export async function POST(req: Request) {
  if (limited(`kayit:${ipOf(req)}`, 5, 3600_000)) return out('e8', 429);
  const b = await req.json().catch(() => ({}));
  const email = String(b.email ?? '').trim().toLowerCase().slice(0, 200);
  const name = String(b.name ?? '').trim().slice(0, 120);
  const company = String(b.company ?? '').trim().slice(0, 160);
  const phone = String(b.phone ?? '').trim().slice(0, 40);
  const pw = String(b.password ?? '');
  if (!email || !pw || !name || !company || !phone) return out('e1');
  if (!EMAIL_RE.test(email)) return out('e2');
  if (pw.length < 8 || pw.length > 200) return out('e3');
  try {
    if (await findByEmail(email)) return out('e4', 409);
    const approved = await autoApprove();
    const r = await insertDealer({ email, name, company, phone, pw_hash: await hashPw(pw), lang: String(b.lang ?? '').slice(0, 2) || null, status: approved ? 'approved' : 'pending', approved_at: approved ? new Date().toISOString() : null });
    if (r.status === 409) return out('e4', 409);
    if (!r.ok) return out('e8', 500);
    const res = NextResponse.json({ ok: true, status: approved ? 'approved' : 'pending', session: approved ? { email, name } : null });
    if (approved) {
      const d = await findByEmail(email);
      if (d) res.cookies.set(COOKIE, makeToken(d.id), cookieOpts());
    }
    return res;
  } catch {
    return out('e8', 500);
  }
}
