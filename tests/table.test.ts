import { describe, expect, it } from 'vitest';
import { clueTarget, combine, FAILS_FOR_CLUE, inventory } from '../src/alchemy/table';
import { createSave } from '../src/game/save';
import { isRoomUnlocked } from '../src/game/progress';

const base = () => ({ ...createSave(), materials: ['su', 'ates', 'toprak', 'hava'] });

describe('simya masası', () => {
  it('tarif varsa madde keşfedilir ve envantere eklenir', () => {
    const { save, outcome } = combine(base(), 'ates', 'su');
    expect(outcome).toMatchObject({ kind: 'discovered', result: 'buhar' });
    expect(save.materials).toContain('buhar');
    expect(save.discoveries).toEqual(['buhar']);
    // Malzemeler kavramdır, harcanmaz.
    expect(save.materials).toContain('su');
  });

  it('tarif yoksa ceza yok; 3 başarısız denemede ipucu', () => {
    let s = base();
    for (let i = 1; i <= FAILS_FOR_CLUE; i++) {
      const r = combine(s, 'su', 'su');
      expect(r.outcome.kind).toBe('nothing');
      expect(r.save.materials).toEqual(s.materials);
      if (r.outcome.kind === 'nothing') expect(r.outcome.showClue).toBe(i === FAILS_FOR_CLUE);
      s = r.save;
    }
    expect(combine(s, 'su', 'ates').save.failStreak).toBe(0);
  });

  it('bilinen madde yeniden keşfedilmez', () => {
    const s1 = combine(base(), 'su', 'ates').save;
    expect(combine(s1, 'ates', 'su').outcome).toEqual({ kind: 'known', result: 'buhar' });
  });

  it('anahtar madde önceki oda bitince Mahzen’i açar', () => {
    const s = {
      ...base(),
      levels: { 'oda1-b20': { best: 20, stars: 3 as const, perfect: false, completions: 1 } },
    };
    expect(isRoomUnlocked(s, 2)).toBe(false);
    const r = combine(s, 'su', 'hava');
    expect(r.outcome).toMatchObject({ kind: 'discovered', result: 'sis', unlockedRoom: 2 });
    expect(isRoomUnlocked(r.save, 2)).toBe(true);
  });

  it('ipucu önce bekleyen anahtarı gösterir', () => {
    expect(clueTarget(base())).toBe('sis');
    expect(clueTarget({ ...createSave(), materials: ['su', 'ates'] })).toBe('buhar');
    expect(clueTarget({ ...createSave(), materials: [] })).toBeNull();
  });

  it('envanter sabit sırada', () => {
    expect(inventory({ ...createSave(), materials: ['hava', 'su'] })).toEqual(['su', 'hava']);
  });
});
