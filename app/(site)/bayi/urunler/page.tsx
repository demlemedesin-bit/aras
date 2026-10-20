import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { DealerCatalog } from '@/components/DealerCatalog';
import { getContent } from '@/lib/content';
import { currentDealer, getPrices } from '@/lib/dealer-server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Bayi ürün kataloğu | Aras Metal', robots: { index: false, follow: false } };

export default async function Page() {
  const [content, dealer] = await Promise.all([getContent(), currentDealer()]);
  const prices = dealer ? await getPrices() : {};
  return (
    <PageShell content={content} follow>
      <DealerCatalog allowed={!!dealer} company={dealer?.company ?? ''} name={dealer?.name ?? ''} email={dealer?.email ?? ''} phone={dealer?.phone ?? ''} prices={prices} />
    </PageShell>
  );
}
