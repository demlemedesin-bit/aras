import type { Lang } from './i18n';

export type Names = Partial<Record<Lang, string>>;
export type SubCat = { id: string; name: Names };
export type Cat = { id: string; world: 'home' | 'garden'; name: Names; subs: SubCat[] };

/** Panelde düzenlenmemişse kullanılan varsayılan ağaç (8 ana, 33 alt kategori). */
export const DEFAULT_CATEGORIES: Cat[] = [
 {
  "id": "garden",
  "world": "garden",
  "name": {
   "tr": "Bahçe",
   "en": "Garden",
   "de": "Garten",
   "fr": "Jardin",
   "es": "Jardín",
   "it": "Giardino"
  },
  "subs": [
   {
    "id": "garden-planter",
    "name": {
     "tr": "Saksı",
     "en": "Planter",
     "de": "Pflanzgefäß",
     "fr": "Jardinière",
     "es": "Macetero",
     "it": "Fioriera"
    }
   },
   {
    "id": "garden-pail-bucket",
    "name": {
     "tr": "Kova",
     "en": "Pail bucket",
     "de": "Eimer",
     "fr": "Seau",
     "es": "Cubo",
     "it": "Secchio"
    }
   },
   {
    "id": "garden-hose-pot",
    "name": {
     "tr": "Hortum saksısı",
     "en": "Hose pot",
     "de": "Schlauchtopf",
     "fr": "Pot à tuyau",
     "es": "Maceta para manguera",
     "it": "Portatubo"
    }
   },
   {
    "id": "garden-incinerator",
    "name": {
     "tr": "Yakma kazanı",
     "en": "Incinerator",
     "de": "Verbrennungsofen",
     "fr": "Incinérateur",
     "es": "Incinerador",
     "it": "Inceneritore"
    }
   },
   {
    "id": "garden-fire-pit",
    "name": {
     "tr": "Ateş çukuru",
     "en": "Fire pit",
     "de": "Feuerschale",
     "fr": "Brasero",
     "es": "Fogonero",
     "it": "Braciere"
    }
   }
  ]
 },
 {
  "id": "watering-can",
  "world": "garden",
  "name": {
   "tr": "Sulama kabı",
   "en": "Watering can",
   "de": "Gießkanne",
   "fr": "Arrosoir",
   "es": "Regadera",
   "it": "Annaffiatoio"
  },
  "subs": []
 },
 {
  "id": "kitchen",
  "world": "home",
  "name": {
   "tr": "Mutfak ve sofra",
   "en": "Kitchen & tabletop",
   "de": "Küche & Tisch",
   "fr": "Cuisine & art de la table",
   "es": "Cocina y mesa",
   "it": "Cucina e tavola"
  },
  "subs": [
   {
    "id": "kitchen-trash-can",
    "name": {
     "tr": "Çöp kutusu",
     "en": "Trash can",
     "de": "Mülleimer",
     "fr": "Poubelle",
     "es": "Cubo de basura",
     "it": "Pattumiera"
    }
   },
   {
    "id": "kitchen-ice-bucket",
    "name": {
     "tr": "Buz kovası",
     "en": "Ice bucket",
     "de": "Eiskübel",
     "fr": "Seau à glace",
     "es": "Cubo de hielo",
     "it": "Secchiello del ghiaccio"
    }
   },
   {
    "id": "kitchen-milk-can",
    "name": {
     "tr": "Süt güğümü",
     "en": "Milk can",
     "de": "Milchkanne",
     "fr": "Pot à lait",
     "es": "Lechera",
     "it": "Bidone del latte"
    }
   },
   {
    "id": "kitchen-bread-box",
    "name": {
     "tr": "Ekmek kutusu",
     "en": "Bread box",
     "de": "Brotkasten",
     "fr": "Boîte à pain",
     "es": "Panera",
     "it": "Portapane"
    }
   },
   {
    "id": "kitchen-serving-stand",
    "name": {
     "tr": "Servis standı",
     "en": "Serving stand",
     "de": "Servierständer",
     "fr": "Présentoir",
     "es": "Soporte de servir",
     "it": "Alzata"
    }
   },
   {
    "id": "kitchen-utensil-caddy",
    "name": {
     "tr": "Mutfak gereçleri kabı",
     "en": "Utensil caddy",
     "de": "Utensilienhalter",
     "fr": "Porte-ustensiles",
     "es": "Portautensilios",
     "it": "Portautensili"
    }
   },
   {
    "id": "kitchen-drink-caddy",
    "name": {
     "tr": "İçecek taşıyıcı",
     "en": "Drink caddy",
     "de": "Getränketräger",
     "fr": "Porte-boissons",
     "es": "Portabebidas",
     "it": "Portabevande"
    }
   },
   {
    "id": "kitchen-tray",
    "name": {
     "tr": "Tepsi",
     "en": "Tray",
     "de": "Tablett",
     "fr": "Plateau",
     "es": "Bandeja",
     "it": "Vassoio"
    }
   },
   {
    "id": "kitchen-storage-box",
    "name": {
     "tr": "Saklama kutusu",
     "en": "Storage box",
     "de": "Aufbewahrungsbox",
     "fr": "Boîte de rangement",
     "es": "Caja de almacenaje",
     "it": "Scatola contenitore"
    }
   },
   {
    "id": "kitchen-drink-dispenser",
    "name": {
     "tr": "İçecek sebili",
     "en": "Drink dispenser",
     "de": "Getränkespender",
     "fr": "Distributeur de boissons",
     "es": "Dispensador de bebidas",
     "it": "Dispenser di bevande"
    }
   },
   {
    "id": "kitchen-pitcher",
    "name": {
     "tr": "Sürahi",
     "en": "Pitcher",
     "de": "Krug",
     "fr": "Pichet",
     "es": "Jarra",
     "it": "Brocca"
    }
   },
   {
    "id": "kitchen-beverage-tub",
    "name": {
     "tr": "İçecek küveti",
     "en": "Beverage tub",
     "de": "Getränkewanne",
     "fr": "Bac à boissons",
     "es": "Cubeta para bebidas",
     "it": "Vasca per bevande"
    }
   }
  ]
 },
 {
  "id": "storage",
  "world": "home",
  "name": {
   "tr": "Depolama ve hırdavat",
   "en": "Storage & hardware",
   "de": "Aufbewahrung & Zubehör",
   "fr": "Rangement & quincaillerie",
   "es": "Almacenaje y ferretería",
   "it": "Contenitori e ferramenta"
  },
  "subs": [
   {
    "id": "storage-log-holder",
    "name": {
     "tr": "Odun taşıyıcı",
     "en": "Log holder",
     "de": "Holzkorb",
     "fr": "Porte-bûches",
     "es": "Leñero",
     "it": "Portalegna"
    }
   },
   {
    "id": "storage-mail-box",
    "name": {
     "tr": "Posta kutusu",
     "en": "Mail box",
     "de": "Briefkasten",
     "fr": "Boîte aux lettres",
     "es": "Buzón",
     "it": "Cassetta postale"
    }
   },
   {
    "id": "storage-trash-can",
    "name": {
     "tr": "Çöp kutusu",
     "en": "Trash can",
     "de": "Mülleimer",
     "fr": "Poubelle",
     "es": "Cubo de basura",
     "it": "Pattumiera"
    }
   },
   {
    "id": "storage-tool-caddy",
    "name": {
     "tr": "Alet taşıyıcı",
     "en": "Tool caddy",
     "de": "Werkzeugträger",
     "fr": "Porte-outils",
     "es": "Portaherramientas",
     "it": "Portattrezzi"
    }
   },
   {
    "id": "storage-wall-organizer",
    "name": {
     "tr": "Duvar düzenleyici",
     "en": "Wall organizer",
     "de": "Wandorganizer",
     "fr": "Organisateur mural",
     "es": "Organizador de pared",
     "it": "Organizzatore da parete"
    }
   },
   {
    "id": "storage-storage-box",
    "name": {
     "tr": "Saklama kutusu",
     "en": "Storage box",
     "de": "Aufbewahrungsbox",
     "fr": "Boîte de rangement",
     "es": "Caja de almacenaje",
     "it": "Scatola contenitore"
    }
   },
   {
    "id": "storage-bbq",
    "name": {
     "tr": "Barbekü",
     "en": "BBQ",
     "de": "Grill",
     "fr": "Barbecue",
     "es": "Barbacoa",
     "it": "Barbecue"
    }
   }
  ]
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
  "subs": [
   {
    "id": "bathroom-laundry-basket",
    "name": {
     "tr": "Çamaşır sepeti",
     "en": "Laundry basket",
     "de": "Wäschekorb",
     "fr": "Panier à linge",
     "es": "Cesto de la colada",
     "it": "Cesto della biancheria"
    }
   },
   {
    "id": "bathroom-trash-can",
    "name": {
     "tr": "Çöp kutusu",
     "en": "Trash can",
     "de": "Mülleimer",
     "fr": "Poubelle",
     "es": "Cubo de basura",
     "it": "Pattumiera"
    }
   },
   {
    "id": "bathroom-wire-basket",
    "name": {
     "tr": "Tel sepet",
     "en": "Wire basket",
     "de": "Drahtkorb",
     "fr": "Panier en fil",
     "es": "Cesta de alambre",
     "it": "Cestino in filo"
    }
   }
  ]
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
  "subs": [
   {
    "id": "lifestyle-planter",
    "name": {
     "tr": "Saksı",
     "en": "Planter",
     "de": "Pflanzgefäß",
     "fr": "Jardinière",
     "es": "Macetero",
     "it": "Fioriera"
    }
   },
   {
    "id": "lifestyle-stool",
    "name": {
     "tr": "Tabure",
     "en": "Stool",
     "de": "Hocker",
     "fr": "Tabouret",
     "es": "Taburete",
     "it": "Sgabello"
    }
   },
   {
    "id": "lifestyle-side-table",
    "name": {
     "tr": "Yan sehpa",
     "en": "Side table",
     "de": "Beistelltisch",
     "fr": "Table d’appoint",
     "es": "Mesa auxiliar",
     "it": "Tavolino"
    }
   },
   {
    "id": "lifestyle-umbrella-holder",
    "name": {
     "tr": "Şemsiyelik",
     "en": "Umbrella holder",
     "de": "Schirmständer",
     "fr": "Porte-parapluies",
     "es": "Paraguero",
     "it": "Portaombrelli"
    }
   },
   {
    "id": "lifestyle-serving-cart",
    "name": {
     "tr": "Servis arabası",
     "en": "Serving cart",
     "de": "Servierwagen",
     "fr": "Desserte",
     "es": "Carrito de servicio",
     "it": "Carrello da servizio"
    }
   },
   {
    "id": "lifestyle-rolling-cart",
    "name": {
     "tr": "Tekerlekli depolama arabası",
     "en": "Storage rolling cart",
     "de": "Rollwagen",
     "fr": "Chariot de rangement",
     "es": "Carrito de almacenaje",
     "it": "Carrello portaoggetti"
    }
   }
  ]
 },
 {
  "id": "pet",
  "world": "home",
  "name": {
   "tr": "Evcil hayvan",
   "en": "Pet products",
   "de": "Haustierbedarf",
   "fr": "Articles pour animaux",
   "es": "Mascotas",
   "it": "Articoli per animali"
  },
  "subs": []
 },
 {
  "id": "angel-chimes",
  "world": "garden",
  "name": {
   "tr": "Melek çanı",
   "en": "Angel chimes",
   "de": "Engelsglocken",
   "fr": "Carillons d’anges",
   "es": "Campanillas de ángel",
   "it": "Campanelli angelo"
  },
  "subs": []
 }
];

/** Eski kayıtlarda kategori yerine metin anahtarı vardı. */
const LEGACY: Record<string, string> = { 'c1.t': 'garden', 'c2.t': 'kitchen', 'f.kitchen': 'kitchen', 'c3.t': 'lifestyle', 'c4.t': 'bathroom', 'c5.t': 'pet' };

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
