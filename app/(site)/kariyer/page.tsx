import { SubView, subMeta } from '@/components/views/Sub';

export const revalidate = 300;
export const generateMetadata = () => subMeta('kariyer', 'tr');

export default function Page() {
  return <SubView slug="kariyer" lang="tr" />;
}
