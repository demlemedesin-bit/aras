import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Faq } from '@/components/SubPages';
import { getContent } from '@/lib/content';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Sık sorulan sorular | Aras Metal', alternates: { canonical: '/sss' } };

export default async function Page() {
  return (
    <PageShell content={await getContent()}>
      <Faq />
    </PageShell>
  );
}
