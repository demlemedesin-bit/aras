import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Faq } from '@/components/SubPages';
import { getContent } from '@/lib/content';
import { pageMetadata, absolute } from '@/lib/seo';
import { resolveDoc } from '@/lib/page-docs';

export const revalidate = 300;
export const generateMetadata = (): Promise<Metadata> => pageMetadata('/sss', { title: 'Sık sorulan sorular | Aras Metal', desc: 'Aras Metal hakkında sık sorulan sorular: sipariş, bayi girişi, ürünler ve showroom.' });

export default async function Page() {
  const content = await getContent();
  const doc = resolveDoc(content.pages, 'sss', 'tr');
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'FAQPage', mainEntity: doc.blocks.filter((b) => b.h && b.p?.length).map((b) => ({ '@type': 'Question', name: b.h, acceptedAnswer: { '@type': 'Answer', text: (b.p ?? []).join(' ') } })) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Aras Metal', item: absolute('/') }, { '@type': 'ListItem', position: 2, name: doc.title, item: absolute('/sss') }] },
    ],
  };
  return (
    <PageShell content={content}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Faq />
    </PageShell>
  );
}
