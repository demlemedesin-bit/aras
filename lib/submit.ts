import { track } from './track';

/** Form gönderimi: Supabase `submissions` tablosuna kaydedilir. E-posta uygulaması açılmaz. */
export type Submission = { name: string; email: string; company?: string; phone?: string; country?: string; message?: string; topic: 'catalog' | 'contact' | 'career'; lang: string; items?: { id: string; code: string; name: string; qty: number; price?: number | null; currency?: string }[] };

export async function sendSubmission(s: Submission): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  try {
    const r = await fetch(`${url}/rest/v1/submissions`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        name: s.name.trim(),
        email: s.email.trim(),
        company: s.company?.trim() || null,
        phone: s.phone?.trim() || null,
        country: s.country?.trim() || null,
        message: s.message?.trim() || (s.topic === 'catalog' ? 'Katalog talebi' : ''),
        topic: s.topic,
        lang: s.lang,
        ...(s.items?.length ? { items: s.items.slice(0, 200) } : {}),
      }),
    });
    if (r.ok) track('event', s.topic === 'catalog' ? 'catalog_submit' : 'contact_submit');
    return r.ok;
  } catch {
    return false;
  }
}
