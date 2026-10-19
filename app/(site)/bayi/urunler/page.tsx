import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { DealerCatalog } from '@/components/DealerCatalog';
import { getContent } from '@/lib/content';
import { currentDealer } from '@/lib/dealer-server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Bayi ürün kataloğu | Aras Metal', robots: { index: false, follow: false } };

export default async function Page() {
  const [content, dealer] = await Promise.all([getContent(), currentDealer()]);
  return (
    <PageShell content={content}>
      <DealerCatalog allowed={!!dealer} company={dealer?.company ?? ''} />
    </PageShell>
  );
}
