import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Cookies } from '@/components/SubPages';
import { getContent } from '@/lib/content';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Çerez politikası | Aras Metal', alternates: { canonical: '/cerez-politikasi' } };

export default async function Page() {
  return (
    <PageShell content={await getContent()}>
      <Cookies />
    </PageShell>
  );
}
