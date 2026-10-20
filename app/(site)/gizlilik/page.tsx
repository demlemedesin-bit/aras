import { SubView, subMeta } from '@/components/views/Sub';

export const revalidate = 300;
export const generateMetadata = () => subMeta('gizlilik', 'tr');

export default function Page() {
  return <SubView slug="gizlilik" lang="tr" />;
}
