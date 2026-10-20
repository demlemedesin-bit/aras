import { notFound } from 'next/navigation';
import HomeView from '@/components/views/Home';
import { isLang } from '@/lib/lang-path';

export const revalidate = 300;
export const dynamicParams = false;
export { generateStaticParams } from './params';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <HomeView lang={lang} />;
}
