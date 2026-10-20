import { SiteProvider } from '@/components/SiteProvider';
import { Sprite } from '@/components/Icon';
import Preloader from '@/components/Preloader';
import Chrome from '@/components/Chrome';
import LangPanel from '@/components/LangPanel';
import AuthDialog from '@/components/AuthDialog';
import CatalogDialog from '@/components/CatalogDialog';
import Tour from '@/components/Tour';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Collections from '@/components/sections/Collections';
import History from '@/components/sections/History';
import Products from '@/components/sections/Products';
import Showroom from '@/components/sections/Showroom';
import Steel from '@/components/sections/Steel';
import News from '@/components/sections/News';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';

import { getContent } from '@/lib/content';
import { catName } from '@/lib/categories';
import { absolute } from '@/lib/seo';

const SECTIONS: Record<string, () => React.ReactElement> = {
  top: Hero, tarihce: History, koleksiyonlar: Collections, urunler: Products, haberler: News, hakkimizda: About, showroom: Showroom, surdurulebilirlik: Steel, iletisim: Contact,
};

/** İçerik panelden değişince /api/revalidate ile anında, aksi halde 5 dakikada bir yenilenir. */
export const revalidate = 300;

export default async function Home() {
  const content = await getContent();
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Aras Metal ürün kategorileri',
    itemListElement: content.categories.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: catName(c.name, 'tr'), url: absolute('/#koleksiyonlar'), ...(c.img ? { image: c.img.startsWith('http') ? c.img : absolute(c.img) } : {}) })),
  };
  return (
    <SiteProvider content={content}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Sprite />
      <Preloader />
      <Chrome />
      <main id="icerik">
        {content.layout.order.filter((id) => !content.layout.hidden.includes(id)).map((id) => {
          const C = SECTIONS[id];
          return C ? <C key={id} /> : null;
        })}
      </main>
      <Footer />
      <AuthDialog />
      <CatalogDialog />
      <Tour />
      <LangPanel />
    </SiteProvider>
  );
}
