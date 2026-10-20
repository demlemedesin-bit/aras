import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Sayfa bulunamadı | Aras Metal', robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <p style={{ fontSize: 64, fontWeight: 800, margin: 0 }}>404</p>
        <h1 style={{ fontSize: 22, margin: '8px 0 16px' }}>Aradığınız sayfa bulunamadı</h1>
        <Link href="/" style={{ textDecoration: 'underline' }}>Ana sayfaya dön</Link>
      </div>
    </main>
  );
}
