'use client'
import { useCallback, useEffect, useState } from 'react'
import { PageHead, api, grid, preview, useToast } from '@panel/components/site/ui'

type F = { name: string; path: string; size: number }
export default function Page() {
  const say = useToast(); const [files, setFiles] = useState<F[]>([]); const [busy, setBusy] = useState(false)
  const load = useCallback(() => api('GET', '/api/site?media=1').then((j) => setFiles(j.files)).catch((e) => say(e.message)), [say])
  useEffect(() => { load() }, [load])
  async function upload(list: FileList) {
    setBusy(true)
    for (const f of Array.from(list)) { try { const fd = new FormData(); fd.append('file', f); await api('POST', '/api/site', fd) } catch (e: any) { say(`${f.name}: ${e.message}`) } }
    setBusy(false); load()
  }
  async function del(f: F) { if (!confirm(`${f.name} silinsin mi? Sitede kullanılıyorsa görsel kaybolur.`)) return; try { await api('POST', '/api/site', { action: 'delete-media', name: f.name }); load() } catch (e: any) { say(e.message) } }
  return (
    <>
      <PageHead title="Medya kütüphanesi" sub="Yüklenen görseller Supabase'de saklanır. Yolu kopyalayıp herhangi bir görsel alanına yapıştırabilir ya da alanın “Kütüphane” düğmesiyle seçebilirsiniz."
        action={<label className="btn" style={{ cursor: 'pointer' }}>{busy ? 'Yükleniyor…' : '+ Görsel yükle'}<input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} /></label>} />
      <div style={grid(170)}>
        {files.map((f) => (
          <div key={f.name} className="card">
            <div style={{ height: 120, background: `var(--s3) center/cover url(${preview(f.path)})` }} />
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.name}>{f.name}</div>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{(f.size / 1024).toFixed(0)} KB</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button className="btn-ghost" onClick={() => { navigator.clipboard.writeText(f.path); say('Yol kopyalandı') }}>Kopyala</button>
                <button className="btn-danger" onClick={() => del(f)}>Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!files.length && <div className="card" style={{ padding: 24, color: 'var(--tx3)' }}>Henüz görsel yüklenmedi</div>}
    </>
  )
}
