import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Privacy } from '@/components/SubPages';
import { getContent } from '@/lib/content';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Gizlilik politikası | Aras Metal', alternates: { canonical: '/gizlilik' } };

export default async function Page() {
  return (
    <PageShell content={await getContent()}>
      <Privacy />
    </PageShell>
  );
}
