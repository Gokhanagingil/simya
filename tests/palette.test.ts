import { describe, expect, it } from 'vitest';
import { COLORS } from '../src/engine';
import { FOG_FILL, FOG_INK, GLASS_INTERIOR, PALETTE } from '../src/config/palette';
import { contrastRatio, deltaE2000, simulateAgedLens, simulateCvd } from '../src/ui/colorMath';

const pairs = COLORS.flatMap((a, i) => COLORS.slice(i + 1).map((b) => [a, b] as const));

describe('palet', () => {
  it('her rengin benzersiz bir sembolü var (bilgi yalnızca renkle verilmez)', () => {
    const symbols = COLORS.map((c) => PALETTE[c].symbol);
    expect(new Set(symbols).size).toBe(COLORS.length);
  });

  it.each(pairs)('%s / %s: CIEDE2000 farkı yüksek (≥ 20)', (a, b) => {
    expect(deltaE2000(PALETTE[a].fill, PALETTE[b].fill)).toBeGreaterThanOrEqual(20);
  });

  it.each(pairs)('%s / %s: yaşlanmış mercek benzetiminde de ayırt edilir (≥ 18)', (a, b) => {
    expect(
      deltaE2000(simulateAgedLens(PALETTE[a].fill), simulateAgedLens(PALETTE[b].fill)),
    ).toBeGreaterThanOrEqual(18);
  });

  it('mavi–mor ve mavi–yeşil çiftleri özellikle uzak (≥ 30)', () => {
    expect(deltaE2000(PALETTE.blue.fill, PALETTE.purple.fill)).toBeGreaterThanOrEqual(30);
    expect(deltaE2000(PALETTE.blue.fill, PALETTE.green.fill)).toBeGreaterThanOrEqual(30);
  });

  it('renk körlüğü benzetimlerinde mavi–mor ve mavi–yeşil karışmaz (≥ 8)', () => {
    for (const kind of ['protan', 'deutan', 'tritan'] as const) {
      const f = (h: string) => simulateCvd(h, kind);
      expect(deltaE2000(f(PALETTE.blue.fill), f(PALETTE.green.fill)), kind).toBeGreaterThanOrEqual(
        8,
      );
    }
    expect(
      deltaE2000(
        simulateCvd(PALETTE.blue.fill, 'tritan'),
        simulateCvd(PALETTE.purple.fill, 'tritan'),
      ),
    ).toBeGreaterThanOrEqual(8);
  });

  it.each(COLORS)('%s: cam içinde ≥ 3:1, sembolü sıvı üstünde ≥ 3:1', (c) => {
    expect(contrastRatio(PALETTE[c].fill, GLASS_INTERIOR)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(PALETTE[c].fill, PALETTE[c].ink)).toBeGreaterThanOrEqual(3);
  });

  it('sisli birim cam içinden ve tüm sıvılardan ayırt edilir', () => {
    expect(contrastRatio(FOG_FILL, FOG_INK)).toBeGreaterThanOrEqual(4.5);
    for (const c of COLORS)
      expect(deltaE2000(FOG_FILL, PALETTE[c].fill)).toBeGreaterThanOrEqual(15);
  });
});
