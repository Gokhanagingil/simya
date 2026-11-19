import { describe, expect, it } from 'vitest';
import { createSave, type SaveData } from '../src/game/save';
import {
  completeLevel,
  continueTarget,
  isLevelUnlocked,
  isRoomUnlocked,
  nextLevelId,
  totalPerfect,
  totalStars,
} from '../src/game/progress';
import { getLevel, levelsOfRoom } from '../src/levels';
import { ECONOMY } from '../src/config/game';

const L1 = getLevel('oda1-b01')!;
const L2 = getLevel('oda1-b02')!;

function clearRoom(save: SaveData, room: number): SaveData {
  let s = save;
  for (const l of levelsOfRoom(room))
    s = completeLevel(s, {
      level: l,
      moves: l.optimalMoves,
      usedPaidPower: false,
      usedExtraBottle: false,
    }).save;
  return s;
}

describe('ilerleme ve ödüller', () => {
  it('ilk tamamlama: 10 + yıldız başına 5 + ilk kusursuz 15 ve malzeme', () => {
    const r = completeLevel(createSave(), {
      level: L1,
      moves: L1.optimalMoves,
      usedPaidPower: false,
      usedExtraBottle: false,
    });
    expect(r.stars).toBe(3);
    expect(r.perfect).toBe(true);
    expect(r.dustEarned).toBe(
      ECONOMY.reward.firstClear + 3 * ECONOMY.reward.perNewStar + ECONOMY.reward.firstPerfect,
    );
    expect(r.save.dust).toBe(ECONOMY.startDust + r.dustEarned);
    expect(r.materials).toEqual(['su', 'ates']);
    expect(r.save.levels[L1.id]).toEqual({
      best: L1.optimalMoves,
      stars: 3,
      perfect: true,
      completions: 1,
    });
  });

  it('tekrar oynamada yalnızca yeni yıldız ve ilk kusursuz ödüllendirilir', () => {
    const many = L2.optimalMoves * 3;
    const a = completeLevel(createSave(), {
      level: L2,
      moves: many,
      usedPaidPower: false,
      usedExtraBottle: false,
    });
    expect(a.stars).toBe(1);
    expect(a.dustEarned).toBe(10 + 5);
    const b = completeLevel(a.save, {
      level: L2,
      moves: many,
      usedPaidPower: false,
      usedExtraBottle: false,
    });
    expect(b.dustEarned).toBe(0);
    const c = completeLevel(b.save, {
      level: L2,
      moves: L2.optimalMoves,
      usedPaidPower: false,
      usedExtraBottle: false,
    });
    expect(c.newStars).toBe(2);
    expect(c.dustEarned).toBe(2 * 5 + 15);
    expect(c.newRecord).toBe(true);
    expect(c.improvedBy).toBe(many - L2.optimalMoves);
  });

  it('ekstra şişeli çözüm rekora sayılmaz, ücretli güçle en fazla 2★', () => {
    const a = completeLevel(createSave(), {
      level: L2,
      moves: L2.optimalMoves + 2,
      usedPaidPower: false,
      usedExtraBottle: false,
    });
    const b = completeLevel(a.save, {
      level: L2,
      moves: L2.optimalMoves - 1,
      usedPaidPower: true,
      usedExtraBottle: true,
    });
    expect(b.stars).toBe(2);
    expect(b.perfect).toBe(false);
    expect(b.newRecord).toBe(false);
    expect(b.save.levels[L2.id]!.best).toBe(L2.optimalMoves + 2);
  });

  it('bölümler sırayla açılır', () => {
    const s = createSave();
    expect(isLevelUnlocked(s, L1)).toBe(true);
    expect(isLevelUnlocked(s, L2)).toBe(false);
    const s2 = completeLevel(s, {
      level: L1,
      moves: 5,
      usedPaidPower: false,
      usedExtraBottle: false,
    }).save;
    expect(isLevelUnlocked(s2, L2)).toBe(true);
  });

  it('oda bitince 50 toz bonusu ve hikâye sayfası; sonraki oda anahtar keşfedilmeden açılmaz', () => {
    const s = clearRoom(createSave(), 1);
    expect(s.roomsCompleted).toEqual([1]);
    expect(s.story).toContain('oda1');
    expect(s.materials).toEqual(['su', 'ates', 'toprak', 'hava']);
    expect(isRoomUnlocked(s, 2)).toBe(false);
    expect(continueTarget(s)).toMatchObject({ kind: 'key', room: { id: 2 } });
    const withKey = { ...s, materials: [...s.materials, 'sis'] };
    expect(isRoomUnlocked(withKey, 2)).toBe(true);
    expect(continueTarget(withKey)).toEqual({ kind: 'level', id: 'oda2-b01' });
    // Oda bonusu bir kez: 20 bölüm × (10 + 15 + 15) + 50
    expect(s.dust).toBe(ECONOMY.startDust + 20 * 40 + 50);
  });

  it('Devam Et: yarım bölüm önceliklidir', () => {
    const s = {
      ...createSave(),
      active: {
        levelId: 'oda1-b01',
        state: { capacity: 4, rules: { fog: false, mix: false }, bottles: [], moves: 2 },
        past: [],
        undosUsed: 0,
        usedPaidPower: false,
        extraBottles: 0,
        hintsUsed: 0,
      },
    };
    expect(continueTarget(s)).toEqual({ kind: 'level', id: 'oda1-b01' });
    expect(continueTarget(createSave())).toEqual({ kind: 'level', id: 'oda1-b01' });
  });

  it('sonraki bölüm kimliği odalar arasında geçer', () => {
    expect(nextLevelId({ room: 1, index: 5 })).toBe('oda1-b06');
    expect(nextLevelId({ room: 1, index: 20 })).toBe('oda2-b01');
    expect(nextLevelId({ room: 3, index: 20 })).toBeNull();
  });

  it('toplam yıldız ve kusursuz sayıları', () => {
    const s = clearRoom(createSave(), 1);
    expect(totalStars(s)).toBe(60);
    expect(totalPerfect(s)).toBe(20);
  });
});
