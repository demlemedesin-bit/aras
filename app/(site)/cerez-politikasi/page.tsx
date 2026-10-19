import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Cookies } from '@/components/SubPages';
import { getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 300;
export const generateMetadata = (): Promise<Metadata> => pageMetadata('/cerez-politikasi', { title: 'Çerez politikası | Aras Metal', desc: 'Aras Metal çerez politikası: kullandığımız çerezler, amaçları ve tercihleriniz.' });

export default async function Page() {
  return (
    <PageShell content={await getContent()}>
      <Cookies />
    </PageShell>
  );
}
