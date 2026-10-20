import { notFound } from 'next/navigation';
import '../(site)/globals.css';
import { SiteRoot, siteMetadata, siteViewport } from '@/lib/site-root';
import { isLang } from '@/lib/lang-path';

export const dynamicParams = false;
export { generateStaticParams } from './params';
export const viewport = siteViewport;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return siteMetadata(lang);
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <SiteRoot lang={lang}>{children}</SiteRoot>;
}
