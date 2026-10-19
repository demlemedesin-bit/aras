'use client'
import { useCallback, useEffect, useState } from 'react'
import { api, getRows, useToast } from './ui'

/** site_settings tablosundan tek bir anahtarı okur/yazar. Kayıt yoksa varsayılan gösterilir. */
export function useSetting<T>(key: string, def: T, norm?: (raw: any) => T) {
  const say = useToast()
  const [val, setVal] = useState<T>(def)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    getRows('site_settings').then((r) => {
      const v = r.find((x) => x.key === key)?.value
      if (v) { setVal(norm ? norm(v) : (v as T)); setSaved(true) }
      setLoaded(true)
    }).catch((e) => say(e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const save = useCallback(async (v: T = val) => {
    setBusy(true)
    try { await api('POST', '/api/site', { action: 'upsert', table: 'site_settings', row: { key, value: v } }); setSaved(true); say('Kaydedildi, site güncellendi.') } catch (e: any) { say(e.message) } finally { setBusy(false) }
  }, [key, val, say])
  return { val, setVal, saved, busy, save, loaded }
}
