import type { Metadata } from 'next';
import Crumbs from '@/components/Crumbs';
import PageShell from '@/components/PageShell';
import { Privacy } from '@/components/SubPages';
import { getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 300;
export const generateMetadata = (): Promise<Metadata> => pageMetadata('/gizlilik', { title: 'Gizlilik politikası | Aras Metal', desc: 'Aras Metal gizlilik politikası: hangi verileri neden ve ne kadar süre işlediğimiz.' });

export default async function Page() {
  return (
    <PageShell content={await getContent()}>
      <Crumbs path="/gizlilik" name="Gizlilik politikası" />
      <Privacy />
    </PageShell>
  );
}
