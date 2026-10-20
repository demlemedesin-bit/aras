import { notFound } from 'next/navigation';
import { SubView, subMeta } from '@/components/views/Sub';
import { isLang } from '@/lib/lang-path';

export const revalidate = 300;
export const dynamicParams = false;
export { generateStaticParams } from '../params';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return subMeta('sss', lang);
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <SubView slug="sss" lang={lang} />;
}
