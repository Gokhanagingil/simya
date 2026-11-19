import { describe, expect, it } from 'vitest';
import { computeStars, threeStarLimit, twoStarLimit } from '../src/game/stars';

describe('yıldız eşikleri', () => {
  it('normal bölüm: 3★ ≤ ⌈en iyi × 1,15⌉, 2★ ≤ ⌈en iyi × 1,5⌉', () => {
    expect(threeStarLimit(12, false)).toBe(14);
    expect(twoStarLimit(12, false)).toBe(18);
    expect(threeStarLimit(20, false)).toBe(23);
    expect(twoStarLimit(20, false)).toBe(30);
  });

  it('sisli bölüm daha esnektir: 1,4 ve 1,8', () => {
    expect(threeStarLimit(10, true)).toBe(14);
    expect(twoStarLimit(10, true)).toBe(18);
  });

  it('tam sayılarda yuvarlama hatası olmaz', () => {
    expect(threeStarLimit(20, false)).toBe(23); // 20 × 1,15 = 23,0000000004
    expect(twoStarLimit(4, false)).toBe(6);
  });

  it('yıldız ve kusursuz hesabı', () => {
    expect(computeStars({ moves: 12, optimal: 12, fog: false, usedPaidPower: false })).toEqual({
      stars: 3,
      perfect: true,
    });
    expect(computeStars({ moves: 14, optimal: 12, fog: false, usedPaidPower: false })).toEqual({
      stars: 3,
      perfect: false,
    });
    expect(computeStars({ moves: 15, optimal: 12, fog: false, usedPaidPower: false })).toEqual({
      stars: 2,
      perfect: false,
    });
    expect(computeStars({ moves: 19, optimal: 12, fog: false, usedPaidPower: false })).toEqual({
      stars: 1,
      perfect: false,
    });
  });

  it('ücretli güç kullanılınca en fazla 2★ ve kusursuz sayılmaz', () => {
    expect(computeStars({ moves: 12, optimal: 12, fog: false, usedPaidPower: true })).toEqual({
      stars: 2,
      perfect: false,
    });
    expect(computeStars({ moves: 30, optimal: 12, fog: false, usedPaidPower: true }).stars).toBe(1);
  });
});
