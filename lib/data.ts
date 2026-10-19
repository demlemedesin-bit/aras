export type World = 'all' | 'home' | 'garden';

export type Collection = {
  id: string;
  world: 'home' | 'garden';
  title: string; // i18n key
  desc: string; // i18n key
  count: number;
  img: string;
  pos?: string;
  subs?: string[]; // i18n keys
};

export const COLLECTIONS: Collection[] = [
  { id: 'garden', world: 'garden', title: 'c1.t', desc: 'c1.d', count: 15, img: '/images/col-garden.webp' },
  { id: 'kitchen', world: 'home', title: 'c2.t', desc: 'c2.d', count: 36, img: '/images/kitchen-bread-1.webp', pos: 'center 62%', subs: ['k.1', 'k.2', 'k.3', 'k.4'] },
  { id: 'lifestyle', world: 'home', title: 'c3.t', desc: 'c3.d', count: 18, img: '/images/lifestyle-1.webp', pos: 'center 55%' },
  { id: 'bathroom', world: 'home', title: 'c4.t', desc: 'c4.d', count: 7, img: '/images/bathroom-1.webp', pos: 'center 60%' },
  { id: 'pet', world: 'home', title: 'c5.t', desc: 'c5.d', count: 3, img: '/images/pet-1.webp', pos: 'center 70%' },
];

export type Product = { id: string; code: string; name: string; cat: string; world: 'home' | 'garden'; img: string };

export const PRODUCTS: Product[] = [
  { id: '21158', code: '21158', name: 'p.21158', cat: 'c1.t', world: 'garden', img: '/images/p-21158.webp' },
  { id: '1400', code: '1400-H', name: 'p.1400', cat: 'c1.t', world: 'garden', img: '/images/p-1400.webp' },
  { id: '1300', code: '1300-A', name: 'p.1300', cat: 'f.kitchen', world: 'home', img: '/images/p-1300.webp' },
  { id: '36383', code: '36383', name: 'p.36383', cat: 'c1.t', world: 'garden', img: '/images/p-36383.webp' },
  { id: '94200', code: '94200', name: 'p.94200', cat: 'f.kitchen', world: 'home', img: '/images/p-94200.webp' },
  { id: '5076', code: '5076', name: 'p.5076', cat: 'c1.t', world: 'garden', img: '/images/p-5076.webp' },
  { id: '36510', code: '36510-CP', name: 'p.36510', cat: 'c3.t', world: 'home', img: '/images/p-36510.webp' },
  { id: '15151', code: '15151', name: 'p.15151', cat: 'c1.t', world: 'garden', img: '/images/p-15151.webp' },
];

/** Galeri grupları: Mutfak alt kategorileri + Lifestyle + Banyo + Evcil hayvan. */
export const GALLERY_GROUPS = [
  { id: 'bread', label: 'k.1', prefix: 'kitchen-bread', count: 6 },
  { id: 'pitchers', label: 'k.2', prefix: 'kitchen-pitchers', count: 5 },
  { id: 'storage', label: 'k.3', prefix: 'kitchen-storage', count: 5 },
  { id: 'trays', label: 'k.4', prefix: 'kitchen-trays', count: 5 },
  { id: 'lifestyle', label: 'c3.t', prefix: 'lifestyle', count: 10 },
  { id: 'bathroom', label: 'c4.t', prefix: 'bathroom', count: 4 },
  { id: 'pet', label: 'c5.t', prefix: 'pet', count: 4 },
] as const;

export type GalleryImage = { src: string; group: string; label: string; n: number };

export const GALLERY: GalleryImage[] = GALLERY_GROUPS.flatMap((g) =>
  Array.from({ length: g.count }, (_, i) => ({ src: `/images/${g.prefix}-${i + 1}.webp`, group: g.id, label: g.label, n: i + 1 })),
);

export const NEWS = [
  { d: 'n3.d', h: 'n3.h', badge: 'n3.a', award: true },
  { d: 'n1.d', h: 'n1.h' },
  { d: 'n2.d', h: 'n2.h' },
  { d: 'n4.d', h: 'n4.h' },
  { d: '', year: '2022', h: 'n5.h' },
] as const;

export const PARTNERS = [
  { name: 'Evidea', href: 'https://www.evidea.com/', img: '/images/logo-evidea.webp' },
  { name: 'Mudo', href: 'https://www.mudo.com.tr/', img: '/images/logo-mudo.svg' },
  { name: 'Retro Time', href: 'https://retrotimecompany.com/', img: '/images/logo-retrotime.webp' },
  { name: 'The Mia', href: 'https://www.themia.com.tr/', img: '/images/logo-themia.webp' },
  { name: 'Dekorz Dükkan', href: 'https://dekorzdukkan.com/', img: '/images/logo-dekorz.webp' },
  { name: 'Arma House', href: 'https://www.armahouse.com/', img: '/images/logo-armahouse.webp' },
] as const;

export const CONTACT = {
  tel: '+90 (212) 855 27 80',
  telHref: 'tel:+902128552780',
  fax: '+90 (212) 856 08 26',
  faxHref: 'tel:+902128560826',
  mail: 'info@arasmetal.com',
  map: 'https://maps.google.com/maps?q=Aras%20Metal%20Adnan%20Kahveci%2C%20Harbiye%20Cd.%20No%3A19%2C%2034528%20Beylikd%C3%BCz%C3%BC%2F%C4%B0stanbul&t=m&z=15&output=embed&iwloc=near',
  directions: 'https://maps.app.goo.gl/fJoSfK563SkRckQ47',
  social: {
    instagram: 'https://www.instagram.com/aras_metal/',
    facebook: 'https://www.facebook.com/ArasMetalLtd/',
    x: 'https://twitter.com/arasmetalltd',
    linkedin: 'https://www.linkedin.com/company/aras-metal',
  },
} as const;

/** Hero görselleri: değiştirmek için sadece buradaki yolları güncelle. */
export const HERO = {
  showroom: '/images/showroom-3.webp',
  home: '/images/kitchen-storage-1.webp',
  garden: '/images/col-garden.webp',
} as const;
