import { SubView, subMeta } from '@/components/views/Sub';

export const revalidate = 300;
export const generateMetadata = () => subMeta('kullanim-kosullari', 'tr');

export default function Page() {
  return <SubView slug="kullanim-kosullari" lang="tr" />;
}
