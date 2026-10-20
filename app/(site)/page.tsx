import HomeView from '@/components/views/Home';

/** İçerik panelden değişince /api/revalidate ile anında, aksi halde 5 dakikada bir yenilenir. */
export const revalidate = 300;

export default function Home() {
  return <HomeView lang="tr" />;
}
