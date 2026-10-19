import type { Lang } from './i18n';

export type Names = Partial<Record<Lang, string>>;
export type SubCat = { id: string; name: Names; img?: string; photos?: string[] };
export type Cat = { id: string; world: 'home' | 'garden'; name: Names; subs: SubCat[]; img?: string; photos?: string[] };

/** Panelde düzenlenmemişse kullanılan varsayılan ağaç (Home: 4, Garden: 6 ana kategori). */
export const DEFAULT_CATEGORIES: Cat[] = [
 {
  "id": "kitchen",
  "world": "home",
  "name": {
   "tr": "Mutfak",
   "en": "Kitchen",
   "de": "Küche",
   "fr": "Cuisine",
   "es": "Cocina",
   "it": "Cucina"
  },
  "subs": [
   {
    "id": "kitchen-bread-boxes",
    "name": {
     "tr": "Ekmek kutuları",
     "en": "Bread boxes",
     "de": "Brotkästen",
     "fr": "Boîtes à pain",
     "es": "Paneras",
     "it": "Portapane"
    },
    "photos": [
     "/images/kitchen-bread-1.webp",
     "/images/kitchen-bread-2.webp",
     "/images/kitchen-bread-3.webp",
     "/images/kitchen-bread-4.webp",
     "/images/kitchen-bread-5.webp",
     "/images/kitchen-bread-6.webp"
    ],
    "img": "/images/kitchen-bread-1.webp"
   },
   {
    "id": "kitchen-pitchers",
    "name": {
     "tr": "Sürahiler",
     "en": "Pitchers",
     "de": "Krüge",
     "fr": "Pichets",
     "es": "Jarras",
     "it": "Brocche"
    },
    "photos": [
     "/images/kitchen-pitchers-1.webp",
     "/images/kitchen-pitchers-2.webp",
     "/images/kitchen-pitchers-3.webp",
     "/images/kitchen-pitchers-4.webp",
     "/images/kitchen-pitchers-5.webp"
    ],
    "img": "/images/kitchen-pitchers-1.webp"
   },
   {
    "id": "kitchen-storage-cans",
    "name": {
     "tr": "Saklama kapları",
     "en": "Storage cans",
     "de": "Vorratsdosen",
     "fr": "Boîtes de rangement",
     "es": "Botes de almacenaje",
     "it": "Contenitori"
    },
    "photos": [
     "/images/kitchen-storage-1.webp",
     "/images/kitchen-storage-2.webp",
     "/images/kitchen-storage-3.webp",
     "/images/kitchen-storage-4.webp",
     "/images/kitchen-storage-5.webp"
    ],
    "img": "/images/kitchen-storage-1.webp"
   },
   {
    "id": "kitchen-trays",
    "name": {
     "tr": "Tepsiler",
     "en": "Trays",
     "de": "Tabletts",
     "fr": "Plateaux",
     "es": "Bandejas",
     "it": "Vassoi"
    },
    "photos": [
     "/images/kitchen-trays-1.webp",
     "/images/kitchen-trays-2.webp",
     "/images/kitchen-trays-3.webp",
     "/images/kitchen-trays-4.webp",
     "/images/kitchen-trays-5.webp"
    ],
    "img": "/images/kitchen-trays-1.webp"
   }
  ],
  "img": "/images/kitchen-bread-1.webp"
 },
 {
  "id": "pet",
  "world": "home",
  "name": {
   "tr": "Evcil hayvan",
   "en": "Pet",
   "de": "Haustier",
   "fr": "Animaux",
   "es": "Mascotas",
   "it": "Animali"
  },
  "subs": [],
  "photos": [
   "/images/pet-1.webp",
   "/images/pet-2.webp",
   "/images/pet-3.webp",
   "/images/pet-4.webp"
  ],
  "img": "/images/pet-1.webp"
 },
 {
  "id": "bathroom",
  "world": "home",
  "name": {
   "tr": "Banyo",
   "en": "Bathroom",
   "de": "Bad",
   "fr": "Salle de bain",
   "es": "Baño",
   "it": "Bagno"
  },
  "subs": [],
  "photos": [
   "/images/bathroom-1.webp",
   "/images/bathroom-2.webp",
   "/images/bathroom-3.webp",
   "/images/bathroom-4.webp"
  ],
  "img": "/images/bathroom-1.webp"
 },
 {
  "id": "lifestyle",
  "world": "home",
  "name": {
   "tr": "Yaşam",
   "en": "Lifestyle",
   "de": "Lifestyle",
   "fr": "Lifestyle",
   "es": "Estilo de vida",
   "it": "Lifestyle"
  },
  "subs": [],
  "photos": [
   "/images/lifestyle-1.webp",
   "/images/lifestyle-2.webp",
   "/images/lifestyle-3.webp",
   "/images/lifestyle-4.webp",
   "/images/lifestyle-5.webp",
   "/images/lifestyle-6.webp",
   "/images/lifestyle-7.webp",
   "/images/lifestyle-8.webp",
   "/images/lifestyle-9.webp",
   "/images/lifestyle-10.webp"
  ],
  "img": "/images/lifestyle-1.webp"
 },
 {
  "id": "planters",
  "world": "garden",
  "name": {
   "tr": "Saksılar",
   "en": "Planters",
   "de": "Pflanzgefäße",
   "fr": "Jardinières",
   "es": "Maceteros",
   "it": "Fioriere"
  },
  "subs": [],
  "img": "/images/col-garden.webp"
 },
 {
  "id": "maintenance",
  "world": "garden",
  "name": {
   "tr": "Bakım",
   "en": "Maintenance",
   "de": "Pflege",
   "fr": "Entretien",
   "es": "Mantenimiento",
   "it": "Manutenzione"
  },
  "subs": []
 },
 {
  "id": "fire-pit-group",
  "world": "garden",
  "name": {
   "tr": "Ateş çukuru grubu",
   "en": "Fire pit group",
   "de": "Feuerschalen",
   "fr": "Groupe brasero",
   "es": "Grupo de fogoneros",
   "it": "Gruppo bracieri"
  },
  "subs": []
 },
 {
  "id": "beverage-tubs",
  "world": "garden",
  "name": {
   "tr": "İçecek küvetleri",
   "en": "Beverage tubs",
   "de": "Getränkewannen",
   "fr": "Bacs à boissons",
   "es": "Cubetas para bebidas",
   "it": "Vasche per bevande"
  },
  "subs": []
 },
 {
  "id": "trash-cans",
  "world": "garden",
  "name": {
   "tr": "Çöp kutuları",
   "en": "Trash cans",
   "de": "Mülleimer",
   "fr": "Poubelles",
   "es": "Cubos de basura",
   "it": "Pattumiere"
  },
  "subs": []
 },
 {
  "id": "watering-cans",
  "world": "garden",
  "name": {
   "tr": "Sulama kapları",
   "en": "Watering cans",
   "de": "Gießkannen",
   "fr": "Arrosoirs",
   "es": "Regaderas",
   "it": "Annaffiatoi"
  },
  "subs": []
 }
];

/** Eski kayıtlarda kategori yerine metin anahtarı vardı. */
const LEGACY: Record<string, string> = { 'c1.t': 'planters', 'c2.t': 'kitchen', 'f.kitchen': 'kitchen', 'c3.t': 'lifestyle', 'c4.t': 'bathroom', 'c5.t': 'pet' };

export const catName = (n: Names | undefined, lang: Lang) => n?.[lang] ?? n?.tr ?? n?.en ?? '';

/** Ürünün cat değeri alt kategori kimliği, ana kategori kimliği ya da eski anahtar olabilir. */
export function resolveCat(tree: Cat[], cat: string): { main?: Cat; sub?: SubCat } {
  const id = LEGACY[cat] ?? cat;
  for (const m of tree) {
    if (m.id === id) return { main: m };
    const s = m.subs.find((x) => x.id === id);
    if (s) return { main: m, sub: s };
  }
  return {};
}
