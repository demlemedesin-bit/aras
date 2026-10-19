# Aras Metal yönetim paneli

Sitenin içinde, aynı Vercel projesinde çalışır: giriş `/login` (kısayol: `/admin`), panel `/dashboard`. Kod: `app/(panel)`, `panel/src`, `middleware.ts`. Aynı Supabase projesini kullanır.

**Menü:** Dashboard · Talepler & Mesajlar · Ürünler · Koleksiyonlar · Galeri · Haberler · İş Ortakları · Metinler (6 dil) · Medya Kütüphanesi · Site Ayarları · Kullanıcılar.

**Dashboard:** yeni/bekleyen talepler, katalog ve iletişim talepleri, son 14 gün talep grafiği, ülkelere göre talepler, site içeriği özeti ve hızlı işlemler.

Kayıt anında site yenilenir. Formdan gelen mesajlar ve katalog talepleri `submissions` tablosuna düşer.

## Roller
- **admin (Yönetici):** tüm panel + Kullanıcılar sayfası (rol verme, şifre değiştirme).
- **manager (Editör):** site içeriği ve talepler.
- Diğer roller panele giremez.

## Kurulum
1. Supabase → Authentication → Users → "Add user" ile hesap açın; `profiles` tablosunda rolü `admin` yapın (ilk hesap otomatik admin olur).
2. Vercel'de `.env.example` değişkenlerini girin (özellikle `SUPABASE_SERVICE_ROLE_KEY`).
