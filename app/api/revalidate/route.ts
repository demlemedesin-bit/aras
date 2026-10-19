import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/** Panel, içerik kaydedince burayı çağırır: Authorization: Bearer $REVALIDATE_SECRET */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidateTag('site-content', { expire: 0 });
  revalidatePath('/');
  return NextResponse.json({ ok: true, at: Date.now() });
}
