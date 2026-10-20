import { SubView, subMeta } from '@/components/views/Sub';

export const revalidate = 300;
export const generateMetadata = () => subMeta('sss', 'tr');

export default function Page() {
  return <SubView slug="sss" lang="tr" />;
}
