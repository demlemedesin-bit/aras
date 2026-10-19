'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@panel/lib/supabase/client'
import TopBar from '@panel/components/TopBar'
import { Modal, Label, Pill, ToastProvider, useToast, type Row } from '@panel/components/site/ui'
import { ROLE_L } from '@panel/lib/nav'

const ROLES = [['admin', 'Yönetici'], ['manager', 'Editör'], ['member', 'Erişim yok']] as const

function Users() {
  const say = useToast()
  const [rows, setRows] = useState<Row[]>([])
  const [me, setMe] = useState('')
  const [pw, setPw] = useState<Row | null>(null)
  const [pw1, setPw1] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser(); setMe(user?.id ?? '')
    const { data, error } = await sb.from('profiles').select('id,full_name,role,created_at').order('created_at')
    if (error) say(error.message); else setRows(data ?? [])
  }, [say])
  useEffect(() => { load() }, [load])

  async function setRole(r: Row, role: string) {
    if (r.id === me) return say('Kendi rolünüzü değiştiremezsiniz')
    const { error } = await createClient().from('profiles').update({ role }).eq('id', r.id)
    if (error) say(error.message); else { say('Rol güncellendi'); load() }
  }
  async function resetPw() {
    if (!pw) return
    if (pw1.length < 8) return say('Şifre en az 8 karakter olmalı')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: pw.id, password: pw1 }) })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'Hata')
      say('Şifre değiştirildi'); setPw(null); setPw1('')
    } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }

  return (
    <>
      <TopBar title="Kullanıcılar" subtitle="Panele erişebilen hesaplar" />
      <div style={{ padding: '18px 20px 40px', overflow: 'auto' }}>
        <div className="card">
          {rows.map((r) => (
            <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--bdr)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <b>{r.full_name || 'İsimsiz'}</b>{r.id === me && <> <Pill tone="ac">Siz</Pill></>}
                <div style={{ color: 'var(--tx3)', fontSize: 12 }}>Oluşturulma: {new Date(r.created_at).toLocaleDateString('tr-TR')}</div>
              </div>
              <select className="inp" style={{ width: 150 }} value={['admin', 'manager'].includes(r.role) ? r.role : 'member'} disabled={r.id === me} onChange={(e) => setRole(r, e.target.value)}>
                {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button className="btn-ghost" onClick={() => { setPw(r); setPw1('') }}>Şifre değiştir</button>
            </div>
          ))}
          {!rows.length && <div style={{ padding: 24, color: 'var(--tx3)' }}>Kullanıcı yok</div>}
        </div>
        <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginTop: 14, lineHeight: 1.6 }}>
          <b>Yönetici:</b> tüm panel + kullanıcı yönetimi. <b>Editör:</b> site içeriği ve talepler. <b>Erişim yok:</b> panele girilemez.
          Yeni kullanıcı eklemek için Supabase → Authentication → Users → Add user, sonra buradan rol verin ({ROLE_L.manager} için "Editör").
        </div>
      </div>
      {pw && (
        <Modal title={`Şifre değiştir · ${pw.full_name || 'Kullanıcı'}`} onClose={() => setPw(null)}
          footer={<><button className="btn-ghost" onClick={() => setPw(null)}>Vazgeç</button><button className="btn" disabled={busy} onClick={resetPw}>{busy ? '…' : 'Kaydet'}</button></>}>
          <Label>Yeni şifre (en az 8 karakter)</Label>
          <input className="inp" type="password" autoComplete="new-password" value={pw1} onChange={(e) => setPw1(e.target.value)} />
        </Modal>
      )}
    </>
  )
}

export default function Page() { return <ToastProvider><Users /></ToastProvider> }
