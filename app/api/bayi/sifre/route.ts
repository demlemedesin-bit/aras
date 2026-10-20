import { NextResponse } from 'next/server';
import { checkPw, currentDealer, ipOf, limited, updatePassword } from '@/lib/dealer-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const out = (err: string, status = 400) => NextResponse.json({ ok: false, err }, { status });

export async function POST(req: Request) {
  const d = await currentDealer();
  if (!d) return out('auth', 401);
  if (limited(`sifre:${ipOf(req)}`, 10, 900_000) || limited(`sifre:${d.id}`, 6, 900_000)) return out('rate', 429);
  const b = await req.json().catch(() => ({}));
  const cur = String(b.current ?? '').slice(0, 200);
  const next = String(b.next ?? '').slice(0, 200);
  if (next.length < 8) return out('short');
  if (!(await checkPw(cur, d.pw_hash))) return out('wrong', 401);
  await updatePassword(d.id, next);
  return NextResponse.json({ ok: true });
}
