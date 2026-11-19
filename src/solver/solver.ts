/**
 * En kısa çözümü bulan A* çözücü.
 * - Durumlar şişe sırasından bağımsız anahtarlarla (kanonik) tekilleştirilir.
 * - Sezgisel fonksiyon kabul edilebilir ve tutarlıdır; bu yüzden bulunan ilk çözüm
 *   KANITLANMIŞ en kısa çözümdür.
 * - Kurallar için oyun motorunu doğrudan kullanır (tek kaynak).
 */
import {
  applyMove,
  canonicalKey,
  isWon,
  listMoves,
  topGroup,
  type GameState,
  type Move,
} from '../engine';
import { MinHeap } from './heap';

export type SolveResult =
  | { status: 'solved'; moves: Move[]; optimal: boolean; expanded: number }
  | { status: 'unsolvable'; expanded: number }
  | { status: 'limit'; expanded: number };

export interface SolveOptions {
  /** En fazla açılacak düğüm sayısı. */
  maxNodes?: number;
  /** Milisaniye cinsinden süre sınırı (ipucu için). */
  timeLimitMs?: number;
  /**
   * Sezgisel ağırlığı. 1 = kanıtlanmış en kısa çözüm. 1'den büyük değerler daha hızlı
   * ama en kısa olması garanti olmayan bir çözüm verir (yalnızca ipucu yedeği).
   */
  weight?: number;
  now?: () => number;
}

/**
 * Kabul edilebilir alt sınır.
 * R: tüm şişelerdeki saf renk koşularının toplamı, F: hedefte dolu olacak şişe sayısı.
 * Klasik/sis: her hamle R'yi en fazla 1 azaltır. Ayrıca tabanda hiç koşusu olmayan
 * her renk için boş şişeye en az bir dökme gerekir ve bu dökme R'yi azaltmaz.
 * Karışım: bir hamle R'yi en fazla 2 azaltabilir.
 */
export function heuristic(state: GameState): number {
  let runs = 0;
  let units = 0;
  const totals = new Map<string, number>();
  const bottoms = new Map<string, number>();
  for (const bottle of state.bottles) {
    units += bottle.length;
    let prev: string | null = null;
    for (let i = 0; i < bottle.length; i++) {
      const c = bottle[i]!.color;
      totals.set(c, (totals.get(c) ?? 0) + 1);
      if (c !== prev) runs++;
      prev = c;
    }
    if (bottle.length > 0) {
      const c = bottle[0]!.color;
      bottoms.set(c, (bottoms.get(c) ?? 0) + 1);
    }
  }
  const filled = Math.ceil(units / state.capacity);
  const excess = Math.max(0, runs - filled);
  if (state.rules.mix) return Math.ceil(excess / 2);
  let needBottom = 0;
  for (const [c, n] of totals) {
    const goalBottles = Math.ceil(n / state.capacity);
    needBottom += Math.max(0, goalBottles - (bottoms.get(c) ?? 0));
  }
  return excess + needBottom;
}

/** Çözücü için budanmış hamle listesi (en kısa çözümü asla dışarıda bırakmaz). */
export function solverMoves(state: GameState): Move[] {
  const all = listMoves(state);
  const out: Move[] = [];
  let firstEmpty = -1;
  for (let i = 0; i < state.bottles.length; i++) {
    if (state.bottles[i]!.length === 0) {
      firstEmpty = i;
      break;
    }
  }
  for (const [from, to] of all) {
    const target = state.bottles[to]!;
    if (target.length === 0) {
      // Boş şişeler birbirinin aynısıdır: yalnızca ilkine dökmek yeter.
      if (to !== firstEmpty) continue;
      // Tek renkli şişeyi bütünüyle boş şişeye dökmek durumu değiştirmez.
      const src = state.bottles[from]!;
      const g = topGroup(src);
      if (g && g.start === 0) continue;
    }
    out.push([from, to]);
  }
  return out;
}

export function solve(start: GameState, options: SolveOptions = {}): SolveResult {
  const maxNodes = options.maxNodes ?? 2_000_000;
  const weight = options.weight ?? 1;
  const now = options.now ?? (() => Date.now());
  const deadline = options.timeLimitMs !== undefined ? now() + options.timeLimitMs : Infinity;

  if (isWon(start)) return { status: 'solved', moves: [], optimal: true, expanded: 0 };

  const states: GameState[] = [start];
  const parents: number[] = [-1];
  const moveFrom: number[] = [-1];
  const moveTo: number[] = [-1];
  const gs: number[] = [0];
  const best = new Map<string, number>([[canonicalKey(start), 0]]);
  const heap = new MinHeap();
  // Öncelik: f, eşitlikte daha derin düğüm önce.
  const SCALE = 4096;
  heap.push(weight * heuristic(start) * SCALE, 0);
  let expanded = 0;

  while (heap.size > 0) {
    const node = heap.pop()!;
    const state = states[node]!;
    const g = gs[node]!;
    const key = canonicalKey(state);
    if ((best.get(key) ?? Infinity) < g) continue;
    if (isWon(state)) {
      const moves: Move[] = [];
      for (let n = node; parents[n]! >= 0; n = parents[n]!) moves.push([moveFrom[n]!, moveTo[n]!]);
      moves.reverse();
      return { status: 'solved', moves, optimal: weight === 1, expanded };
    }
    expanded++;
    if (expanded > maxNodes) return { status: 'limit', expanded };
    if ((expanded & 255) === 0 && now() > deadline) return { status: 'limit', expanded };

    for (const [from, to] of solverMoves(state)) {
      const next = applyMove(state, from, to).state;
      const nk = canonicalKey(next);
      const ng = g + 1;
      if ((best.get(nk) ?? Infinity) <= ng) continue;
      best.set(nk, ng);
      const id = states.length;
      states.push(next);
      parents.push(node);
      moveFrom.push(from);
      moveTo.push(to);
      gs.push(ng);
      const f = ng + weight * heuristic(next);
      heap.push(f * SCALE - ng, id);
    }
  }
  return { status: 'unsolvable', expanded };
}
