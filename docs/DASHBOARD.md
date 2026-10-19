# Aras Metal yönetim paneli

Sitenin içinde, aynı Vercel projesinde çalışır: giriş `/login` (kısayol: `/admin`), panel `/dashboard`. Kod: `app/(panel)`, `panel/src`, `middleware.ts`. Aynı Supabase projesini kullanır.

**Menü:** Dashboard · Talepler & Mesajlar · Ziyaretçi analizi · SEO · Ürünler · Koleksiyonlar · Galeri · Haberler · İş Ortakları · Metinler (6 dil) · Medya Kütüphanesi · Site Ayarları · Kullanıcılar.

**Dashboard:** ziyaretçi, sayfa görüntüleme, gelen talep ve dönüşüm kartları, ziyaretçi/talep grafiği, dikkat gerekenler (yanıtsız talep, eksik çeviri, görselsiz ürün, SEO), talep durumu ve site içeriği özeti.

**Ziyaretçi analizi:** 7/14/30/90 gün; ziyaretçi, görüntüleme, talep dönüşümü, hangi bölümlere ulaşıldığı, etkileşimler (katalog formu, telefon/e-posta/WhatsApp tıklaması, 360° tur, dil değişimi), talep hunisi, trafik kaynakları, ülke, cihaz, dil.

**SEO:** canlı site denetimi (başlık, açıklama, Open Graph, canonical, JSON-LD, robots.txt, sitemap.xml, görsel alt metinleri, hız), arama sonucu önizlemeli başlık/açıklama düzenleme ve Google Search Console doğrulama kodu.

## Ölçüm ve gizlilik
Site, `/api/track` ile çerezsiz ölçüm yapar. Ham IP saklanmaz, ziyaretçi kimliği her gün değişen tek yönlü bir özettir. Bot trafiği ve panele giriş yapmış tarayıcılar sayılmaz. Veriler `site_views` tablosunda tutulur, 400 günden eski kayıtlar otomatik silinir. Migration'lar: `supabase/migrations/0002_site_views.sql`, `0003_site_events.sql`.

Kayıt anında site yenilenir. Formdan gelen mesajlar ve katalog talepleri `submissions` tablosuna düşer.

## Roller
- **admin (Yönetici):** tüm panel + Kullanıcılar sayfası (rol verme, şifre değiştirme).
- **manager (Editör):** site içeriği ve talepler.
- Diğer roller panele giremez.

## Kurulum
1. Supabase → Authentication → Users → "Add user" ile hesap açın; `profiles` tablosunda rolü `admin` yapın (ilk hesap otomatik admin olur).
2. Vercel'de `.env.example` değişkenlerini girin (özellikle `SUPABASE_SERVICE_ROLE_KEY`).
