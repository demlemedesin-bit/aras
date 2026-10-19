'use client'
import { PageHead } from '@panel/components/site/ui'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://arasmetal.com'
const enc = encodeURIComponent
const TOOLS: [string, string, string][] = [
  ['Google Search Console', 'Aramada kaç kez göründüğünüzü, tıklanmayı, sıralamayı ve dizin hatalarını gösterir.', 'https://search.google.com/search-console'],
  ['PageSpeed Insights', 'Mobil ve masaüstü hız ile Core Web Vitals ölçümü.', `https://pagespeed.web.dev/analysis?url=${enc(SITE)}`],
  ['Zengin sonuç testi', 'Yapılandırılmış verinin (SSS, kurum) Google’da geçerli olup olmadığını denetler.', `https://search.google.com/test/rich-results?url=${enc(SITE)}`],
  ['Bing Webmaster Tools', 'Bing ve Yandex dışı arama motorlarında dizinleme ve sıralama.', 'https://www.bing.com/webmasters'],
  ['Google’da dizindeki sayfalar', 'site: aramasıyla Google’ın hangi sayfaları dizine aldığını görün.', `https://www.google.com/search?q=site:${enc(SITE.replace(/^https?:\/\//, ''))}`],
  ['Paylaşım önizlemesi (Facebook)', 'Linkin WhatsApp/Facebook’ta nasıl görüneceğini ve önbelleği yeniler.', `https://developers.facebook.com/tools/debug/?q=${enc(SITE)}`],
  ['Google Analytics', 'Etiket bağlıysa Reklam sayfasından GA4 kimliğini girin.', 'https://analytics.google.com'],
  ['Google Ads', 'Kampanya yönetimi ve dönüşüm takibi.', 'https://ads.google.com'],
  ['Meta Reklam Yöneticisi', 'Facebook/Instagram reklamları ve piksel olayları.', 'https://adsmanager.facebook.com'],
  ['Google Trends', 'Anahtar kelime ilgisini ülke ve zamana göre karşılaştırın.', 'https://trends.google.com'],
]
export default function Tools() {
  return (
    <>
      <PageHead title="SEO araçları" sub="Panelde ölçemediğimiz verileri (Google sıralaması, tıklama) resmi araçlardan izleyin." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {TOOLS.map(([n, d, h]) => (
          <a key={n} href={h} target="_blank" rel="noopener" className="card" style={{ padding: '16px 18px', textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <b>{n} ↗</b>
            <div style={{ color: 'var(--tx3)', fontSize: 12.5, marginTop: 6, lineHeight: 1.55 }}>{d}</div>
          </a>
        ))}
      </div>
    </>
  )
}
