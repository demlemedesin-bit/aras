import { NextResponse } from 'next/server';
import { currentDealer } from '@/lib/dealer-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const d = await currentDealer();
  return NextResponse.json({ session: d ? { email: d.email, name: d.name } : null }, { headers: { 'Cache-Control': 'no-store' } });
}
