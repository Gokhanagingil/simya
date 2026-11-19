import { describe, expect, it } from 'vitest';
import { computeBoardLayout } from '../src/game/layout';

describe('şişe yerleşimi', () => {
  it.each([3, 5, 6, 8, 10, 11, 12])(
    '360 dp genişlikte %i şişe sığar, dokunma alanı görselden geniş',
    (n) => {
      // 360×800 ekranda üst/alt çubuklardan sonra kalan alan yaklaşık 328×430.
      const L = computeBoardLayout(n, 328, 430);
      expect(L.slots).toHaveLength(n);
      expect(L.rows).toBe(n <= 5 ? 1 : 2);
      for (const s of L.slots) {
        expect(s.x).toBeGreaterThanOrEqual(-0.01);
        expect(s.x + s.w).toBeLessThanOrEqual(328.01);
        expect(s.w).toBeGreaterThan(L.bottleW);
        expect(s.h).toBeGreaterThan(L.bottleH);
        expect(s.by).toBeGreaterThanOrEqual(s.y + L.lift);
      }
      // Şişeler arasında en az 12 dp boşluk.
      expect(L.slots[0]!.w - L.bottleW).toBeGreaterThanOrEqual(12);
      // 12 şişede bile şişeler büyük kalır.
      expect(L.bottleW).toBeGreaterThanOrEqual(36);
      expect(L.bottleH).toBeGreaterThanOrEqual(150);
    },
  );

  it('dokunma yuvaları üst üste binmez', () => {
    const L = computeBoardLayout(11, 328, 430);
    for (let i = 0; i < L.slots.length; i++)
      for (let j = i + 1; j < L.slots.length; j++) {
        const a = L.slots[i]!;
        const b = L.slots[j]!;
        const overlap =
          a.x < b.x + b.w - 0.01 &&
          b.x < a.x + a.w - 0.01 &&
          a.y < b.y + b.h - 0.01 &&
          b.y < a.y + a.h - 0.01;
        expect(overlap).toBe(false);
      }
  });
});
