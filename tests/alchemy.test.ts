import { describe, expect, it } from 'vitest';
import { APEX_ID, MATERIALS, MATERIAL_BY_ID, RECIPES, findRecipe } from '../src/alchemy/recipes';
import { ROOMS } from '../src/config/rooms';
import { LEVELS } from '../src/levels';
import { tr } from '../src/i18n/tr';

/** Verilen malzemelerle ulaşılabilecek her şey (kapanış). */
function closure(start: Iterable<string>): Set<string> {
  const owned = new Set(start);
  for (let changed = true; changed;) {
    changed = false;
    for (const r of RECIPES) {
      if (owned.has(r.a) && owned.has(r.b) && !owned.has(r.result)) {
        owned.add(r.result);
        changed = true;
      }
    }
  }
  return owned;
}

function rewardsUpTo(room: number, index: number): string[] {
  return LEVELS.filter((l) => l.room < room || (l.room === room && l.index <= index)).flatMap(
    (l) => l.reward.materials ?? [],
  );
}

describe('tarif ağacı', () => {
  it('15–20 tarif, 4 temel madde ve 3 katman', () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(15);
    expect(RECIPES.length).toBeLessThanOrEqual(20);
    expect(MATERIALS.filter((m) => m.kind === 'element').map((m) => m.id)).toEqual([
      'su',
      'ates',
      'toprak',
      'hava',
    ]);
    expect(new Set(MATERIALS.filter((m) => m.kind === 'compound').map((m) => m.layer))).toEqual(
      new Set([1, 2, 3]),
    );
  });

  it('çift tanım yok: her çift ve her ürün tek tarifte', () => {
    const pairs = RECIPES.map((r) => [r.a, r.b].sort().join('+'));
    expect(new Set(pairs).size).toBe(pairs.length);
    const results = RECIPES.map((r) => r.result);
    expect(new Set(results).size).toBe(results.length);
  });

  it('yetim tarif yok: her girdi ve ürün tanımlı, her bileşik bir tarifle üretilir', () => {
    for (const r of RECIPES) {
      expect(MATERIAL_BY_ID.has(r.a)).toBe(true);
      expect(MATERIAL_BY_ID.has(r.b)).toBe(true);
      expect(MATERIAL_BY_ID.get(r.result)?.kind).toBe('compound');
    }
    for (const m of MATERIALS.filter((x) => x.kind === 'compound')) {
      expect(RECIPES.some((r) => r.result === m.id)).toBe(true);
    }
    // Bölüm ödülü olan her malzeme temel madde ya da ilkedir.
    for (const l of LEVELS)
      for (const id of l.reward.materials ?? [])
        expect(MATERIAL_BY_ID.get(id)?.kind).not.toBe('compound');
  });

  it('tüm bileşikler 1. aşamanın ödülleriyle ulaşılabilir', () => {
    const all = closure(rewardsUpTo(99, 99));
    for (const m of MATERIALS) expect(all.has(m.id)).toBe(true);
  });

  it('her oda anahtarı, önceki odanın ödülleriyle ulaşılabilir; daha önce değil', () => {
    for (const room of ROOMS.filter((r) => r.key)) {
      const prev = room.id - 1;
      expect(closure(rewardsUpTo(prev, 20)).has(room.key!)).toBe(true);
      expect(closure(rewardsUpTo(prev, 9)).has(room.key!)).toBe(false);
    }
  });

  it('her maddenin adı, bilmecesi, açık ipucu ve açıklaması var', () => {
    for (const m of MATERIALS) {
      const t = tr.materials[m.id as keyof typeof tr.materials];
      expect(t, m.id).toBeDefined();
      expect(t.name.length).toBeGreaterThan(1);
      if (m.kind === 'compound') {
        expect(t.riddle.length).toBeGreaterThan(20);
        expect(t.clue.length).toBeGreaterThan(10);
      }
      expect(t.text.length).toBeGreaterThan(10);
    }
    expect(tr.materials[APEX_ID as keyof typeof tr.materials]).toBeDefined();
  });

  it('findRecipe sıradan bağımsızdır', () => {
    expect(findRecipe('ates', 'su')?.result).toBe('buhar');
    expect(findRecipe('su', 'ates')?.result).toBe('buhar');
    expect(findRecipe('su', 'su')).toBeNull();
  });
});
