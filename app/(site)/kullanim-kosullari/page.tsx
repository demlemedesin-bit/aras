import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Terms } from '@/components/SubPages';
import { getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 300;
export const generateMetadata = (): Promise<Metadata> => pageMetadata('/kullanim-kosullari', { title: 'Kullanım koşulları | Aras Metal', desc: 'Aras Metal web sitesi kullanım koşulları.' });

export default async function Page() {
  return (
    <PageShell content={await getContent()}>
      <Terms />
    </PageShell>
  );
}
