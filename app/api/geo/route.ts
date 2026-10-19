import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Ziyaretçinin ülkesine göre site dili (Vercel ülke başlığı).
const MAP: Record<string, string> = {
  TR: 'tr', CY: 'tr',
  GB: 'en', IE: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en', ZA: 'en', IN: 'en', SG: 'en', AE: 'en',
  DE: 'de', AT: 'de', CH: 'de', LI: 'de', LU: 'de',
  FR: 'fr', BE: 'fr', MC: 'fr', SN: 'fr', CI: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', UY: 'es', BO: 'es', PY: 'es', CR: 'es', PA: 'es', DO: 'es', GT: 'es', HN: 'es', SV: 'es', NI: 'es', CU: 'es',
  IT: 'it', SM: 'it', VA: 'it',
};

export function GET(req: Request) {
  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  return NextResponse.json({ country, lang: MAP[country] ?? null }, { headers: { 'Cache-Control': 'no-store' } });
}
