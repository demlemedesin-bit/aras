import './globals.css';
import { SiteRoot, siteMetadata, siteViewport } from '@/lib/site-root';

export const generateMetadata = () => siteMetadata('tr');
export const viewport = siteViewport;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteRoot lang="tr">{children}</SiteRoot>;
}
