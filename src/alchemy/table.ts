/** Simya masası mantığı (saf): iki malzemeyi birleştirir; ceza yok, malzeme harcanmaz. */
import { ROOMS } from '../config/rooms';
import type { SaveData } from '../game/save';
import { isRoomUnlocked } from '../game/progress';
import { MATERIALS, findRecipe, recipeFor, type Recipe } from './recipes';

export type CombineOutcome =
  | { kind: 'discovered'; result: string; recipe: Recipe; unlockedRoom: number | null }
  | { kind: 'known'; result: string }
  | { kind: 'nothing'; showClue: boolean };

/** Art arda kaç başarısız denemeden sonra defter açık bir ipucu verir. */
export const FAILS_FOR_CLUE = 3;

export function combine(
  save: SaveData,
  a: string,
  b: string,
): { save: SaveData; outcome: CombineOutcome } {
  const recipe = findRecipe(a, b);
  if (!recipe) {
    const failStreak = save.failStreak + 1;
    return {
      save: { ...save, failStreak },
      outcome: {
        kind: 'nothing',
        showClue: failStreak >= FAILS_FOR_CLUE && failStreak % FAILS_FOR_CLUE === 0,
      },
    };
  }
  if (save.materials.includes(recipe.result)) {
    return { save: { ...save, failStreak: 0 }, outcome: { kind: 'known', result: recipe.result } };
  }
  const next: SaveData = {
    ...save,
    failStreak: 0,
    materials: [...save.materials, recipe.result],
    discoveries: [...save.discoveries, recipe.result],
  };
  // Anahtar madde bir odayı açtıysa.
  let unlockedRoom: number | null = null;
  for (const room of ROOMS) {
    if (
      room.key === recipe.result &&
      !isRoomUnlocked(save, room.id) &&
      isRoomUnlocked(next, room.id)
    )
      unlockedRoom = room.id;
  }
  return {
    save: next,
    outcome: { kind: 'discovered', result: recipe.result, recipe, unlockedRoom },
  };
}

/**
 * Açık ipucu için seçilecek madde: önce bekleyen oda anahtarı, sonra elde olan malzemelerle
 * yapılabilecek ilk keşif.
 */
export function clueTarget(save: SaveData): string | null {
  const owned = new Set(save.materials);
  const doable = MATERIALS.filter((m) => {
    if (owned.has(m.id) || m.kind !== 'compound') return false;
    const r = recipeFor(m.id);
    return r !== null && owned.has(r.a) && owned.has(r.b);
  }).map((m) => m.id);
  const keyFirst = ROOMS.map((r) => r.key).find((k) => k && doable.includes(k));
  return keyFirst ?? doable[0] ?? null;
}

/** Envanterdeki malzemeler (gösterim sırası: temel maddeler, ilkeler, keşif sırası). */
export function inventory(save: SaveData): string[] {
  const owned = new Set(save.materials);
  return MATERIALS.filter((m) => owned.has(m.id)).map((m) => m.id);
}
