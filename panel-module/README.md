# Site Yönetimi modülü (Daydream paneline eklenir)

Aras Metal sitesinin içeriğini (metinler, koleksiyonlar, ürünler, galeri, haberler, ortaklar, hero/iletişim ayarları, gelen mesajlar) panelden yönetir.

## Kurulum (panel reposunda)
1. `src/lib/aras.ts`, `src/app/api/site/route.ts`, `src/app/dashboard/site/page.tsx` dosyalarını panele aynı yollarla kopyalayın.
2. `src/components/Sidebar.tsx` → "İş Yönetimi" grubuna ekleyin:
   `{ href: '/dashboard/site', label: 'Site Yönetimi', Icon: Globe, roles: ['admin','manager'] },` (lucide-react'tan `Globe` import edin)
3. `src/middleware.ts` → `MANAGER_PLUS` listesine `'/dashboard/site'` ekleyin.
4. Panelin ortam değişkenlerine ekleyin (Vercel):
   - `ARAS_SUPABASE_URL=https://cohfahystgncnrvxdflm.supabase.co`
   - `ARAS_SERVICE_ROLE_KEY=` (Aras Supabase projesi → Settings → API → service_role; **yalnızca sunucuda**, asla `NEXT_PUBLIC_` yapmayın)
   - `ARAS_SITE_URL=https://arasmetal.com`
   - `ARAS_REVALIDATE_SECRET=` (sitedeki `REVALIDATE_SECRET` ile aynı)

Panel kendi Supabase projesinde (kullanıcılar/roller) çalışmaya devam eder; Aras içeriği ayrı `aras` projesindedir ve yalnızca bu modül üzerinden service role ile yazılır.
