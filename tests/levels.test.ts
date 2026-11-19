import { describe, expect, it } from 'vitest';
import { isComplete, isWon, playMoves } from '../src/engine';
import { LEVELS, levelsOfRoom } from '../src/levels';
import { stateFromLevel } from '../src/levels/difficulty';
import { LEVEL_SCHEMA_VERSION } from '../src/levels/schema';
import { ROOMS } from '../src/config/rooms';
import { solve } from '../src/solver/solver';

describe('bölüm paketi', () => {
  it('3 oda × 20 bölüm = 60 bölüm, kimlikler benzersiz', () => {
    expect(LEVELS).toHaveLength(60);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(60);
    for (const room of ROOMS) expect(levelsOfRoom(room.id)).toHaveLength(room.levelCount);
  });

  it.each(LEVELS.map((l) => [l.id, l] as const))('%s: şema ve 1. aşama sınırları', (_, l) => {
    expect(l.schemaVersion).toBe(LEVEL_SCHEMA_VERSION);
    expect(l.capacity).toBe(4);
    expect(l.bottles.length).toBeLessThanOrEqual(10);
    expect(new Set(l.bottles.flat()).size).toBeLessThanOrEqual(8);
    expect(l.hidden.map((h) => h.length)).toEqual(l.bottles.map((b) => b.length));
    expect(l.bottles.every((b) => b.length <= l.capacity)).toBe(true);
    // Toplam birim sayısı kapasitenin katı olmalı (her şişe dolu bitebilsin).
    expect(l.bottles.flat().length % l.capacity).toBe(0);
    const s = stateFromLevel(l);
    expect(s.bottles.some((b) => isComplete(b, l.capacity))).toBe(false);
    expect(isWon(s)).toBe(false);
  });

  it.each(LEVELS.map((l) => [l.id, l] as const))(
    '%s: saklı çözüm motorda kazanır ve optimalMoves ile eşleşir',
    (_, l) => {
      const end = playMoves(stateFromLevel(l), l.solution);
      expect(isWon(end)).toBe(true);
      expect(l.solution.length).toBe(l.optimalMoves);
      expect(end.moves).toBe(l.optimalMoves);
    },
  );

  it('mekanikler odalara göre doğru', () => {
    for (const l of LEVELS) {
      if (l.room === 1) expect(l.mechanics).toEqual(['classic']);
      if (l.room === 2) expect(l.mechanics).toContain('fog');
      if (l.room === 3) expect(l.mechanics).toContain('mix');
    }
    // Sisli bölümlerin hepsinde en az bir gizli birim var.
    for (const l of levelsOfRoom(2)) expect(l.hidden.flat().some(Boolean)).toBe(true);
  });
});

describe('zorluk eğrisi', () => {
  it.each(ROOMS.map((r) => [r.id] as const))(
    'oda %i: ilk bölüm en kolay, son bölümler en zor, testere dişi',
    (room) => {
      const d = levelsOfRoom(room).map((l) => l.difficulty);
      const max = Math.max(...d);
      expect(d[0]).toBe(Math.min(...d));
      // Odanın en zor bölümü son üç bölümden biri.
      expect(Math.max(...d.slice(-3))).toBe(max);
      // Son bölüm, ilk 17 bölümün hepsinden zor ya da eşit.
      expect(d[d.length - 1]).toBeGreaterThanOrEqual(Math.max(...d.slice(0, 17)) - 0.02);
      // Testere dişi: en az 4 kez zorluk düşer (zor bölümden sonra rahat bölüm).
      let drops = 0;
      for (let i = 1; i < d.length; i++) if (d[i]! < d[i - 1]!) drops++;
      expect(drops).toBeGreaterThanOrEqual(4);
      // Genel eğilim artan.
      const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
      expect(avg(d.slice(-5))).toBeGreaterThan(avg(d.slice(0, 5)));
    },
  );

  it('ilk bölümler yeni mekaniği çok kolay tanıtır', () => {
    for (const room of ROOMS) {
      const first = levelsOfRoom(room.id)[0]!;
      expect(first.optimalMoves).toBeLessThanOrEqual(6);
      expect(first.bottles.length).toBeLessThanOrEqual(4);
    }
  });
});

describe('en kısa çözüm kanıtı (örneklem)', () => {
  // Tüm paket üretimde kanıtlandı; burada her odadan örnekler yeniden çözülür.
  const sample = LEVELS.filter((l) => l.index % 5 === 1 || l.index === 4);
  it.each(sample.map((l) => [l.id, l] as const))(
    '%s: çözücü yeniden aynı uzunluğu kanıtlar',
    (_, l) => {
      const r = solve(stateFromLevel(l), { maxNodes: 600_000 });
      expect(r.status).toBe('solved');
      if (r.status === 'solved') expect(r.moves.length).toBe(l.optimalMoves);
    },
  );
});
