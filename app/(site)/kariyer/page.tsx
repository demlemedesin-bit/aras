import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Careers } from '@/components/SubPages';
import { getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 300;
export const generateMetadata = (): Promise<Metadata> => pageMetadata('/kariyer', { title: 'Kariyer | Aras Metal', desc: 'Aras Metal ekibine katılın. Başvurunuzu bırakın, uygun pozisyon açıldığında sizinle iletişime geçelim.' });

export default async function Page() {
  return (
    <PageShell content={await getContent()}>
      <Careers />
    </PageShell>
  );
}
