import { absolute } from '@/lib/seo';

/** Alt sayfalar için BreadcrumbList yapılandırılmış verisi. */
export default function Crumbs({ path, name }: { path: string; name: string }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Aras Metal', item: absolute('/') },
      { '@type': 'ListItem', position: 2, name, item: absolute(path) },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />;
}
