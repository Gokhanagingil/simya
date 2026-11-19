/**
 * Zorluk puanı. Ağırlıklar ve kalibrasyon: docs/ZORLUK.md
 */
import {
  applyMove,
  createState,
  hiddenCount,
  isWon,
  listMoves,
  mulberry32,
  type GameState,
  type Move,
} from '../engine';
import { solve } from '../solver/solver';
import type { LevelDef } from './schema';

export interface DifficultyFeatures {
  /** En kısa çözüm uzunluğu. */
  readonly optimal: number;
  readonly colors: number;
  readonly empties: number;
  /** En kısa çözüm yolundaki ortalama geçerli hamle sayısı (dallanma). */
  readonly branching: number;
  /** Rastgele oyunların çözümsüz bir duruma düşme oranı (tuzak yoğunluğu, 0–1). */
  readonly trapRate: number;
  /** Gizli birimlerin toplam birime oranı. */
  readonly hiddenRatio: number;
  /** Karışması gereken ana renk birimlerinin oranı. */
  readonly mixRatio: number;
}

export const DIFFICULTY_WEIGHTS = {
  optimal: 0.3,
  colors: 0.15,
  empties: 0.1,
  branching: 0.1,
  trapRate: 0.2,
  hidden: 0.1,
  mix: 0.05,
} as const;

function norm(value: number, lo: number, hi: number): number {
  return Math.min(1, Math.max(0, (value - lo) / (hi - lo)));
}

export function scoreDifficulty(f: DifficultyFeatures): number {
  const w = DIFFICULTY_WEIGHTS;
  const emptyFactor = f.empties <= 1 ? 1 : f.empties === 2 ? 0.5 : 0.15;
  const raw =
    w.optimal * norm(f.optimal, 3, 34) +
    w.colors * norm(f.colors, 2, 8) +
    w.empties * emptyFactor +
    w.branching * norm(f.branching, 2, 14) +
    w.trapRate * f.trapRate +
    w.hidden * norm(f.hiddenRatio, 0, 0.6) +
    w.mix * norm(f.mixRatio, 0, 0.6);
  return Math.round(raw * 1000) / 1000;
}

export function stateFromLevel(
  level: Pick<LevelDef, 'bottles' | 'hidden' | 'capacity' | 'mechanics'>,
): GameState {
  return createState(level.bottles, {
    capacity: level.capacity,
    mechanics: level.mechanics,
    hidden: level.hidden,
  });
}

/** Tuzak yoğunluğu: rastgele oynanan yolların sonunda çözümsüz kalma oranı. */
export function measureTrapRate(
  start: GameState,
  optimal: number,
  seed: number,
  playouts = 24,
): number {
  // Karışım bölümlerinde arama pahalıdır: daha az ve daha sınırlı deneme.
  const budget = start.rules.mix ? 12_000 : 40_000;
  const runs = start.rules.mix ? Math.min(playouts, 14) : playouts;
  const rand = mulberry32(seed ^ 0x5eed);
  let traps = 0;
  let counted = 0;
  for (let p = 0; p < runs; p++) {
    let s = start;
    const steps = Math.max(2, Math.round(optimal * (0.4 + rand() * 0.6)));
    for (let i = 0; i < steps && !isWon(s); i++) {
      const moves = listMoves(s);
      if (moves.length === 0) break;
      const [f, t] = moves[Math.floor(rand() * moves.length)]!;
      s = applyMove(s, f, t).state;
    }
    if (isWon(s)) {
      counted++;
      continue;
    }
    const r = solve(s, { maxNodes: budget });
    if (r.status === 'limit') continue;
    counted++;
    if (r.status === 'unsolvable') traps++;
  }
  return counted === 0 ? 0 : traps / counted;
}

export function measureBranching(start: GameState, solution: readonly Move[]): number {
  let s = start;
  let total = 0;
  for (const [f, t] of solution) {
    total += listMoves(s).length;
    s = applyMove(s, f, t).state;
  }
  return solution.length === 0 ? 0 : total / solution.length;
}

export function measureFeatures(
  start: GameState,
  solution: readonly Move[],
  seed: number,
): DifficultyFeatures {
  const units = start.bottles.reduce((n, b) => n + b.length, 0);
  const colors = new Set(start.bottles.flatMap((b) => b.map((u) => u.color))).size;
  const empties = start.bottles.filter((b) => b.length === 0).length;
  let mixUnits = 0;
  if (start.rules.mix) {
    // Hedefte kalmayacak ana renk birimleri: dört katı olmayan ana renk fazlası karışmak zorundadır.
    const counts = new Map<string, number>();
    for (const b of start.bottles)
      for (const u of b) counts.set(u.color, (counts.get(u.color) ?? 0) + 1);
    for (const c of ['red', 'yellow', 'blue']) mixUnits += (counts.get(c) ?? 0) % start.capacity;
  }
  return {
    optimal: solution.length,
    colors,
    empties,
    branching: measureBranching(start, solution),
    trapRate: measureTrapRate(start, solution.length, seed),
    hiddenRatio: units === 0 ? 0 : hiddenCount(start) / units,
    mixRatio: units === 0 ? 0 : mixUnits / units,
  };
}
