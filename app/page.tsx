import { SiteProvider } from '@/components/SiteProvider';
import { Sprite } from '@/components/Icon';
import Preloader from '@/components/Preloader';
import Chrome from '@/components/Chrome';
import LangPanel from '@/components/LangPanel';
import AuthDialog from '@/components/AuthDialog';
import Tour from '@/components/Tour';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Collections from '@/components/sections/Collections';
import Gallery from '@/components/sections/Gallery';
import Products from '@/components/sections/Products';
import Showroom from '@/components/sections/Showroom';
import Steel from '@/components/sections/Steel';
import News from '@/components/sections/News';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <SiteProvider>
      <Sprite />
      <Preloader />
      <Chrome />
      <main id="icerik">
        <Hero />
        <About />
        <Collections />
        <Gallery />
        <Products />
        <Showroom />
        <Steel />
        <News />
        <Contact />
      </main>
      <Footer />
      <AuthDialog />
      <Tour />
      <LangPanel />
    </SiteProvider>
  );
}
