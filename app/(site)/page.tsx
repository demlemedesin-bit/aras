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

/** İçerik panelden değişince /api/revalidate ile anında, aksi halde 5 dakikada bir yenilenir. */
export const revalidate = 300;

export default async function Home() {
  const content = await getContent();
  return (
    <SiteProvider content={content}>
      <Sprite />
      <Preloader />
      <Chrome />
      <main id="icerik">
        <Hero />
        <History />
        <Collections />
        <Products />
        <News />
        <About />
        <Showroom />
        <Steel />
        <Contact />
      </main>
      <Footer />
      <AuthDialog />
      <CatalogDialog />
      <Tour />
      <LangPanel />
    </SiteProvider>
  );
}
