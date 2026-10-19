# Site yönetimi

Site içeriği Supabase `aras` projesinde durur (`site_*` tabloları). Site her 5 dakikada bir okur; panel kaydedince `/api/revalidate` ile anında yenilenir. Supabase'e ulaşılamazsa gömülü varsayılan içerik gösterilir (site hiçbir zaman boş kalmaz).

| Tablo | İçerik |
|---|---|
| `site_texts` | Tüm metinler, 6 dil (`t` site, `ui` arayüz, `auth` bayi girişi, `meta` başlık/açıklama) |
| `site_collections`, `site_products` | Koleksiyonlar, öne çıkan ürünler (başlık/ad `site_texts` anahtarına bağlı) |
| `site_gallery_groups`, `site_gallery_images` | Galeri sekmeleri ve görselleri |
| `site_news`, `site_partners` | Haberler, iş ortakları |
| `site_settings` | `hero` (3 görsel), `contact` (telefon, e-posta, harita, sosyal), `langs` |
| `submissions` | İletişim formundan gelen mesajlar |
| `dealers` | Bayi hesapları için hazır tablo (Supabase Auth bağlanınca kullanılacak) |

Görseller: `/images/..` (repodaki dosyalar) ya da `storage:dosya.webp` (Supabase `site-media` kovası; panelden yüklenir).

Güvenlik: tüm içerik tabloları herkese **okunur**, **yazma yalnızca service role** ile (panel sunucusu). `submissions` için anonim yalnızca ekleme yapılabilir.

Panel kurulumu: `panel-module/README.md`. Siteyi çalıştırmak için `.env.example` değerlerini Vercel'e girin.
