import { NextResponse } from 'next/server';
import { langForCountry } from '@/lib/geo-lang';

export const dynamic = 'force-dynamic';



export function GET(req: Request) {
  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  return NextResponse.json({ country, lang: langForCountry(country) }, { headers: { 'Cache-Control': 'no-store' } });
}
