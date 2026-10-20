import type { Metadata } from 'next';
import Crumbs from '@/components/Crumbs';
import PageShell from '@/components/PageShell';
import { Faq, Careers, Privacy, Cookies, Terms } from '@/components/SubPages';
import { getContent } from '@/lib/content';
import { pageMetadata, absolute } from '@/lib/seo';
import { resolveDoc, PAGE_NAMES, type PageSlug } from '@/lib/page-docs';
import { pathFor } from '@/lib/lang-path';
import type { Lang } from '@/lib/i18n';

export type SubSlug = PageSlug;
export const SUB_SLUGS: SubSlug[] = ['sss', 'kariyer', 'gizlilik', 'cerez-politikasi', 'kullanim-kosullari'];

const META: Record<SubSlug, { title: string; desc: string; key: string }> = {
  sss: { title: 'Sık sorulan sorular | Aras Metal', desc: 'Aras Metal hakkında sık sorulan sorular: sipariş, bayi girişi, ürünler ve showroom.', key: 'ft.faq' },
  kariyer: { title: 'Kariyer | Aras Metal', desc: 'Aras Metal ekibine katılın. Başvurunuzu bırakın, uygun pozisyon açıldığında sizinle iletişime geçelim.', key: 'ft.car' },
  gizlilik: { title: 'Gizlilik politikası | Aras Metal', desc: 'Aras Metal gizlilik politikası: hangi verileri neden ve ne kadar süre işlediğimiz.', key: 'ft.priv' },
  'cerez-politikasi': { title: 'Çerez politikası | Aras Metal', desc: 'Aras Metal çerez politikası: kullandığımız çerezler, amaçları ve tercihleriniz.', key: 'ft.cookie' },
  'kullanim-kosullari': { title: 'Kullanım koşulları | Aras Metal', desc: 'Aras Metal web sitesi kullanım koşulları.', key: 'ft.terms' },
};

export const subMeta = (slug: SubSlug, lang: Lang): Promise<Metadata> => pageMetadata(`/${slug}`, META[slug], lang);

export async function SubView({ slug, lang }: { slug: SubSlug; lang: Lang }) {
  const content = await getContent();
  const doc = resolveDoc(content.pages, slug, lang);
  const path = `/${slug}`;
  const name = lang === 'tr' ? PAGE_NAMES[slug] : doc.title;
  let extra: React.ReactNode;
  if (slug === 'sss') {
    const ld = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'FAQPage', inLanguage: lang, mainEntity: doc.blocks.filter((b) => b.h && b.p?.length).map((b) => ({ '@type': 'Question', name: b.h, acceptedAnswer: { '@type': 'Answer', text: (b.p ?? []).join(' ') } })) },
        { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Aras Metal', item: absolute(pathFor(lang, '/')) }, { '@type': 'ListItem', position: 2, name: doc.title, item: absolute(pathFor(lang, path)) }] },
      ],
    };
    extra = <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />;
  } else extra = <Crumbs path={path} name={name} lang={lang} />;
  const Body = { sss: Faq, kariyer: Careers, gizlilik: Privacy, 'cerez-politikasi': Cookies, 'kullanim-kosullari': Terms }[slug];
  return (
    <PageShell content={content} lang={lang}>
      {extra}
      <Body />
    </PageShell>
  );
}
