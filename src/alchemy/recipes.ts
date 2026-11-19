/**
 * Simya masası verileri. Tarif ağacı ve kurallar: docs/TARIFLER.md
 * Metinler (ad, bilmece, ipucu) src/i18n/tr.ts içindedir.
 */

export type MaterialKind = 'element' | 'principle' | 'compound';

export interface MaterialDef {
  readonly id: string;
  readonly kind: MaterialKind;
  /** Piramit katmanı: 0 = temel (taban), 1–3 = katmanlar. */
  readonly layer: 0 | 1 | 2 | 3;
  /** Kartta ve piramitte kullanılan renk. */
  readonly tint: string;
}

export interface Recipe {
  readonly a: string;
  readonly b: string;
  readonly result: string;
}

export const MATERIALS: readonly MaterialDef[] = [
  // Temel maddeler ve ilkeler (bölümlerden kazanılır)
  { id: 'su', kind: 'element', layer: 0, tint: '#2f7fd8' },
  { id: 'ates', kind: 'element', layer: 0, tint: '#d9462b' },
  { id: 'toprak', kind: 'element', layer: 0, tint: '#8a5a2e' },
  { id: 'hava', kind: 'element', layer: 0, tint: '#7fa9c9' },
  { id: 'tuz', kind: 'principle', layer: 0, tint: '#b9b1a3' },
  { id: 'civa', kind: 'principle', layer: 0, tint: '#8f969e' },
  // 1. katman: Doğa
  { id: 'buhar', kind: 'compound', layer: 1, tint: '#9fb4c4' },
  { id: 'camur', kind: 'compound', layer: 1, tint: '#6e4f33' },
  { id: 'lav', kind: 'compound', layer: 1, tint: '#e0621c' },
  { id: 'kum', kind: 'compound', layer: 1, tint: '#d9b36c' },
  { id: 'kivilcim', kind: 'compound', layer: 1, tint: '#f0a22a' },
  { id: 'sis', kind: 'compound', layer: 1, tint: '#a7aebb' },
  { id: 'tas', kind: 'compound', layer: 1, tint: '#7d7a76' },
  // 2. katman: Zanaat
  { id: 'tugla', kind: 'compound', layer: 2, tint: '#a8452f' },
  { id: 'cam', kind: 'compound', layer: 2, tint: '#4fa6a0' },
  { id: 'kurum', kind: 'compound', layer: 2, tint: '#3d3a38' },
  { id: 'billur', kind: 'compound', layer: 2, tint: '#9c7fd1' },
  { id: 'murekkep', kind: 'compound', layer: 2, tint: '#2b3a67' },
  { id: 'bulut', kind: 'compound', layer: 2, tint: '#b8c3cf' },
  // 3. katman: Işık
  { id: 'isik', kind: 'compound', layer: 3, tint: '#f2c230' },
  { id: 'gokkusagi', kind: 'compound', layer: 3, tint: '#d9467a' },
  { id: 'mercek', kind: 'compound', layer: 3, tint: '#3c8fa8' },
  { id: 'prizma', kind: 'compound', layer: 3, tint: '#7a5cc7' },
  { id: 'ayna', kind: 'compound', layer: 3, tint: '#6f8796' },
];

export const RECIPES: readonly Recipe[] = [
  // Ateşle birleşen ısınır ya da sertleşir · Suyla birleşen yumuşar ya da çözülür
  // Havayla birleşen hafifler ya da dağılır · Toprakla birleşen ağırlaşır ya da çöker
  { a: 'su', b: 'ates', result: 'buhar' },
  { a: 'toprak', b: 'su', result: 'camur' },
  { a: 'toprak', b: 'ates', result: 'lav' },
  { a: 'toprak', b: 'hava', result: 'kum' },
  { a: 'ates', b: 'hava', result: 'kivilcim' },
  { a: 'su', b: 'hava', result: 'sis' },
  { a: 'toprak', b: 'toprak', result: 'tas' },
  { a: 'camur', b: 'ates', result: 'tugla' },
  { a: 'kum', b: 'ates', result: 'cam' },
  { a: 'kivilcim', b: 'toprak', result: 'kurum' },
  { a: 'kum', b: 'tuz', result: 'billur' },
  { a: 'kurum', b: 'su', result: 'murekkep' },
  { a: 'buhar', b: 'hava', result: 'bulut' },
  { a: 'kivilcim', b: 'hava', result: 'isik' },
  { a: 'isik', b: 'su', result: 'gokkusagi' },
  { a: 'cam', b: 'ates', result: 'mercek' },
  { a: 'billur', b: 'isik', result: 'prizma' },
  { a: 'cam', b: 'civa', result: 'ayna' },
];

/** Piramidin tepesi: 1. aşamada kilitli kalır. */
export const APEX_ID = 'kayip-renk';

export const MATERIAL_BY_ID: ReadonlyMap<string, MaterialDef> = new Map(
  MATERIALS.map((m) => [m.id, m]),
);

export function findRecipe(x: string, y: string): Recipe | null {
  return RECIPES.find((r) => (r.a === x && r.b === y) || (r.a === y && r.b === x)) ?? null;
}

export function recipeFor(result: string): Recipe | null {
  return RECIPES.find((r) => r.result === result) ?? null;
}

/** Elde olan malzemelerle yapılabilecek ama henüz keşfedilmemiş tarifler. */
export function availableRecipes(owned: ReadonlySet<string>): Recipe[] {
  return RECIPES.filter((r) => owned.has(r.a) && owned.has(r.b) && !owned.has(r.result));
}
