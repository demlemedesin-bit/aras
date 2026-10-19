# Aras Metal yönetim paneli

Sitenin içinde, aynı Vercel projesinde çalışır: giriş `/login` (kısayol: `/admin`), panel `/dashboard`. Kod: `app/(panel)`, `panel/src`, `middleware.ts`. Aynı Supabase projesini kullanır.

**Modüller:** Dashboard · Müşteriler · Görevler · Takvim · Notlar · İçerik · Onay · Paylaşım · Operasyon · Gecikmeler · Finans · Muhasebe · Performans · Kullanıcılar (roller) · Şablonlar · Araçlar · Otomasyonlar (SMS/e-posta) · Toplantılar · Destek · Kılavuz · **Site Yönetimi**.

**Site Yönetimi:** web sitesinin her parçası (6 dilli metinler, koleksiyonlar, ürünler, galeri, haberler, ortaklar, hero görselleri, iletişim bilgileri, medya kütüphanesi) ve formdan gelen **Mesajlar / Katalog talepleri** buradan yönetilir. Kayıt anında siteyi yeniler.

## Kurulum
1. `supabase/panel-schema.sql` dosyasını Supabase SQL Editor'de bir kez çalıştırın (tablolar, roller, güvenlik kuralları). Site tabloları zaten kurulu.
2. Supabase → Authentication → Users → "Add user" ile ilk hesabı açın. Hiç yönetici yoksa ilk açılan hesap otomatik **admin** olur; sonrakiler `Kullanıcılar` sayfasından davet edilir/roller verilir.
3. Vercel'de `.env.example` değişkenlerini girin (özellikle `SUPABASE_SERVICE_ROLE_KEY`). Tek proje olduğu için ayrı bir revalidate anahtarı gerekmez.

## Veri ve güvenlik
Roller: admin, manager, member, muhasebe. Finans yalnızca admin ve muhasebe; sistem ayarları (SMS/SMTP şifreleri) yalnızca admin/manager; kişisel notlar, bildirimler yalnızca sahibi görür; rol yükseltmeyi yalnızca admin yapabilir. Site içeriği tabloları herkese okunur, yazma yalnızca panelin sunucu tarafından (service role).

## Web sitesi formları
"Katalog iste" ve iletişim formu e-posta uygulaması açmaz; kayıt `submissions` tablosuna düşer ve panelde Site Yönetimi → Mesajlar'da görünür.
