import { absolute } from '@/lib/seo';
import { pathFor } from '@/lib/lang-path';

/** Alt sayfalar için BreadcrumbList yapılandırılmış verisi. */
export default function Crumbs({ path, name, lang = 'tr' }: { path: string; name: string; lang?: string }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Aras Metal', item: absolute(pathFor(lang, '/')) },
      { '@type': 'ListItem', position: 2, name, item: absolute(pathFor(lang, path)) },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />;
}
