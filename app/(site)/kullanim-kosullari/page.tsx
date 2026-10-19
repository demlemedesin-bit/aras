import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Terms } from '@/components/SubPages';
import { getContent } from '@/lib/content';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Kullanım koşulları | Aras Metal', alternates: { canonical: '/kullanim-kosullari' } };

export default async function Page() {
  return (
    <PageShell content={await getContent()}>
      <Terms />
    </PageShell>
  );
}
