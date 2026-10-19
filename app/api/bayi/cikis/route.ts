import { NextResponse } from 'next/server';
import { COOKIE, cookieOpts } from '@/lib/dealer-server';

export const runtime = 'nodejs';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', cookieOpts(0));
  return res;
}
