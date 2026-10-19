import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ARAS_TABLES, arasDelete, arasRevalidate, arasSelect, arasUpload, arasUpsert, pkOf, type ArasTable } from '@/lib/aras'

// Yalnızca giriş yapmış admin/manager rolü site içeriğini düzenleyebilir.
async function guard() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return false
  const { data } = await sb.from('profiles').select('role').eq('id', user.id).single()
  return data?.role === 'admin' || data?.role === 'manager'
}
const isTable = (t: unknown): t is ArasTable => typeof t === 'string' && (ARAS_TABLES as readonly string[]).includes(t)
const fail = (e: unknown, s = 500) => NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: s })

export async function GET(req: Request) {
  if (!(await guard())) return fail('Yetkisiz', 401)
  const table = new URL(req.url).searchParams.get('table')
  if (!isTable(table)) return fail('Geçersiz tablo', 400)
  try { return NextResponse.json({ rows: await arasSelect(table, table === 'site_texts' ? 'ns,key' : table === 'site_settings' ? 'key' : 'sort') }) } catch (e) { return fail(e) }
}

export async function POST(req: Request) {
  if (!(await guard())) return fail('Yetkisiz', 401)
  // Görsel yükleme (multipart): alan "file"
  if (req.headers.get('content-type')?.startsWith('multipart/form-data')) {
    const fd = await req.formData(); const f = fd.get('file')
    if (!(f instanceof File)) return fail('Dosya yok', 400)
    const safe = f.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')
    try { return NextResponse.json({ path: await arasUpload(`${Date.now()}-${safe}`, f, f.type || 'application/octet-stream') }) } catch (e) { return fail(e) }
  }
  const { action, table, row } = await req.json().catch(() => ({}))
  if (!isTable(table) || table === 'submissions' && action !== 'delete' && action !== 'upsert') return fail('Geçersiz istek', 400)
  try {
    if (action === 'upsert') await arasUpsert(table, row)
    else if (action === 'delete') await arasDelete(table, Object.fromEntries(pkOf(table).map((k) => [k, row[k]])))
    else return fail('Geçersiz işlem', 400)
    const revalidated = table === 'submissions' ? null : await arasRevalidate()
    return NextResponse.json({ ok: true, revalidated })
  } catch (e) { return fail(e) }
}
