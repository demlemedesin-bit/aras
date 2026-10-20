import { SubView, subMeta } from '@/components/views/Sub';

export const revalidate = 300;
export const generateMetadata = () => subMeta('cerez-politikasi', 'tr');

export default function Page() {
  return <SubView slug="cerez-politikasi" lang="tr" />;
}
