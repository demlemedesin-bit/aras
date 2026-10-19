import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Careers } from '@/components/SubPages';
import { getContent } from '@/lib/content';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Kariyer | Aras Metal', alternates: { canonical: '/kariyer' } };

export default async function Page() {
  return (
    <PageShell content={await getContent()}>
      <Careers />
    </PageShell>
  );
}
