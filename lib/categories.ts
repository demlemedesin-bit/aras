import type { Lang } from './i18n';

export type Names = Partial<Record<Lang, string>>;
export type SubCat = { id: string; name: Names };
export type Cat = { id: string; world: 'home' | 'garden'; name: Names; subs: SubCat[] };

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
    }
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
    }
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
    }
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
    }
   }
  ]
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
  "subs": []
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
  "subs": []
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
  "subs": []
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
  "subs": []
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
