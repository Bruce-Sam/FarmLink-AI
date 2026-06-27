import { ProduceUnit } from '@prisma/client';

export interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  unitOptions: ProduceUnit[];
}

// Canonical produce catalogue used for seeding and AI normalization.
export const PRODUCE_CATEGORIES: SeedCategory[] = [
  { name: 'Tomatoes', slug: 'tomatoes', description: 'Fresh tomatoes', unitOptions: [ProduceUnit.CRATE, ProduceUnit.KG, ProduceUnit.BASKET] },
  { name: 'Onions', slug: 'onions', description: 'Onions', unitOptions: [ProduceUnit.BAG, ProduceUnit.SACK, ProduceUnit.KG] },
  { name: 'Maize', slug: 'maize', description: 'Maize / corn', unitOptions: [ProduceUnit.BAG, ProduceUnit.TONNE, ProduceUnit.KG] },
  { name: 'Cassava', slug: 'cassava', description: 'Cassava tubers', unitOptions: [ProduceUnit.BAG, ProduceUnit.KG, ProduceUnit.TONNE] },
  { name: 'Yam', slug: 'yam', description: 'Yam tubers', unitOptions: [ProduceUnit.PIECE, ProduceUnit.BAG, ProduceUnit.KG] },
  { name: 'Plantain', slug: 'plantain', description: 'Plantain', unitOptions: [ProduceUnit.BUNCH, ProduceUnit.BOX, ProduceUnit.KG] },
  { name: 'Rice', slug: 'rice', description: 'Paddy / milled rice', unitOptions: [ProduceUnit.BAG, ProduceUnit.SACK, ProduceUnit.TONNE] },
  { name: 'Pepper', slug: 'pepper', description: 'Hot / sweet pepper', unitOptions: [ProduceUnit.BASKET, ProduceUnit.BAG, ProduceUnit.KG] },
  { name: 'Okra', slug: 'okra', description: 'Okra', unitOptions: [ProduceUnit.BASKET, ProduceUnit.BAG, ProduceUnit.KG] },
  { name: 'Cabbage', slug: 'cabbage', description: 'Cabbage', unitOptions: [ProduceUnit.BOX, ProduceUnit.PIECE, ProduceUnit.KG] },
  { name: 'Carrots', slug: 'carrots', description: 'Carrots', unitOptions: [ProduceUnit.BAG, ProduceUnit.BOX, ProduceUnit.KG] },
  { name: 'Pineapple', slug: 'pineapple', description: 'Pineapple', unitOptions: [ProduceUnit.PIECE, ProduceUnit.BOX, ProduceUnit.CRATE] },
  { name: 'Mango', slug: 'mango', description: 'Mango', unitOptions: [ProduceUnit.BOX, ProduceUnit.CRATE, ProduceUnit.KG] },
  { name: 'Orange', slug: 'orange', description: 'Oranges', unitOptions: [ProduceUnit.BAG, ProduceUnit.BOX, ProduceUnit.CRATE] },
  { name: 'Watermelon', slug: 'watermelon', description: 'Watermelon', unitOptions: [ProduceUnit.PIECE, ProduceUnit.BOX, ProduceUnit.KG] },
];

// Maps free-text synonyms to canonical category slugs for AI extraction.
export const PRODUCE_SYNONYMS: Record<string, string> = {
  tomato: 'tomatoes',
  tomatoes: 'tomatoes',
  'fresh tomato': 'tomatoes',
  onion: 'onions',
  onions: 'onions',
  maize: 'maize',
  corn: 'maize',
  cassava: 'cassava',
  yam: 'yam',
  yams: 'yam',
  plantain: 'plantain',
  plantains: 'plantain',
  rice: 'rice',
  pepper: 'pepper',
  peppers: 'pepper',
  chili: 'pepper',
  chilli: 'pepper',
  okra: 'okra',
  okro: 'okra',
  cabbage: 'cabbage',
  carrot: 'carrots',
  carrots: 'carrots',
  pineapple: 'pineapple',
  pineapples: 'pineapple',
  mango: 'mango',
  mangoes: 'mango',
  mangos: 'mango',
  orange: 'orange',
  oranges: 'orange',
  watermelon: 'watermelon',
  watermelons: 'watermelon',
};

// Maps free-text unit words to the canonical ProduceUnit enum.
export const UNIT_SYNONYMS: Record<string, ProduceUnit> = {
  kg: ProduceUnit.KG,
  kgs: ProduceUnit.KG,
  kilo: ProduceUnit.KG,
  kilos: ProduceUnit.KG,
  kilogram: ProduceUnit.KG,
  kilograms: ProduceUnit.KG,
  tonne: ProduceUnit.TONNE,
  tonnes: ProduceUnit.TONNE,
  ton: ProduceUnit.TONNE,
  tons: ProduceUnit.TONNE,
  crate: ProduceUnit.CRATE,
  crates: ProduceUnit.CRATE,
  bag: ProduceUnit.BAG,
  bags: ProduceUnit.BAG,
  box: ProduceUnit.BOX,
  boxes: ProduceUnit.BOX,
  bunch: ProduceUnit.BUNCH,
  bunches: ProduceUnit.BUNCH,
  piece: ProduceUnit.PIECE,
  pieces: ProduceUnit.PIECE,
  pcs: ProduceUnit.PIECE,
  basket: ProduceUnit.BASKET,
  baskets: ProduceUnit.BASKET,
  sack: ProduceUnit.SACK,
  sacks: ProduceUnit.SACK,
};

export function normalizeProduceName(raw: string): string | null {
  const key = raw.trim().toLowerCase();
  if (PRODUCE_SYNONYMS[key]) return PRODUCE_SYNONYMS[key];
  for (const [synonym, slug] of Object.entries(PRODUCE_SYNONYMS)) {
    if (key.includes(synonym)) return slug;
  }
  return null;
}

export function normalizeUnit(raw: string): ProduceUnit | null {
  const key = raw.trim().toLowerCase();
  return UNIT_SYNONYMS[key] ?? null;
}

export function categoryNameFromSlug(slug: string): string | null {
  return PRODUCE_CATEGORIES.find((c) => c.slug === slug)?.name ?? null;
}
