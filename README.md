# Aras Metal

Aras Metal (galvaniz çelik ev, bahçe ve sofra ürünleri) kurumsal sitesi. Next.js (App Router) + TypeScript.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Yapı

- `app/` sayfa, layout ve global CSS
- `components/` üst çubuk, hero, bölümler, 360° tur, dil paneli, bayi girişi
- `lib/data.ts` koleksiyonlar, ürünler, galeri, haberler, iletişim ve hero görselleri
- `lib/i18n-data.json` 6 dilli metinler (TR, EN, DE, FR, ES, IT)
- `public/images/` tüm görseller

## Notlar

- Hero görsellerini değiştirmek için `lib/data.ts` içindeki `HERO` yollarını güncelle.
- Galeriye görsel eklemek için dosyayı `public/images/` altına koyup `GALLERY_GROUPS` sayısını artır.
- Bayi girişi (`lib/auth.ts`) yalnızca tarayıcıda çalışan bir arayüz kilidi; gerçek yetkilendirme için Supabase Auth'a geçilmeli.
