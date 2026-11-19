/**
 * En kısa çözümü bulan A* çözücü.
 * - Durumlar şişe sırasından bağımsız anahtarlarla (kanonik) tekilleştirilir.
 * - Sezgisel fonksiyon kabul edilebilir ve tutarlıdır; bu yüzden bulunan ilk çözüm
 *   KANITLANMIŞ en kısa çözümdür (weight = 1 iken).
 * - Kurallar için oyun motorunu doğrudan kullanır (tek kaynak). Bellek için düğümler
 *   motorun şişe anahtarlarıyla sıkıştırılmış metin olarak saklanır.
 */
import {
  applyMove,
  bottleFromKey,
  bottleKey,
  isWon,
  listMoves,
  topGroup,
  type Bottle,
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

interface KeyStats {
  runs: number;
  /** Ana renk (kırmızı, sarı, mavi) koşuları. */
  primaryRuns: number;
  bottom: string;
}

const PRIMARY_CODES = new Set(['r', 'y', 'b']);

/** Karışımla oluşturulamayan ve dönüşmeyen renkler (pembe, kahverengi, gri). */
const FIXED_CODES = new Set(['k', 'n', 'a']);

class HeuristicContext {
  private cache = new Map<string, KeyStats>();
  private totals = new Map<string, number>();
  private readonly fixedOnly: boolean;

  constructor(
    start: readonly string[],
    private readonly capacity: number,
    private readonly mix: boolean,
  ) {
    this.fixedOnly = mix;
    for (const key of start) {
      for (const ch of key.toLowerCase()) this.totals.set(ch, (this.totals.get(ch) ?? 0) + 1);
    }
  }

  private stats(key: string): KeyStats {
    let st = this.cache.get(key);
    if (!st) {
      const lower = key.toLowerCase();
      let runs = 0;
      let primaryRuns = 0;
      for (let i = 0; i < lower.length; i++) {
        if (i === 0 || lower[i] !== lower[i - 1]) {
          runs++;
          if (PRIMARY_CODES.has(lower[i]!)) primaryRuns++;
        }
      }
      st = { runs, primaryRuns, bottom: lower[0] ?? '' };
      this.cache.set(key, st);
    }
    return st;
  }

  /**
   * Kabul edilebilir alt sınır.
   * R: saf renk koşularının toplamı, F: hedefte dolu olacak şişe sayısı (R ≥ F, hedefte R = F).
   * Klasik/sis: her hamle R'yi en fazla 1 azaltır. Tabanda yeterli koşusu olmayan her renk için
   * boş şişeye dökme gerekir; bu dökmeler R'yi azaltmaz → toplanabilir.
   * Karışım: R = Rn + Ra (ana renk olmayan + ana renk koşuları). Karışım hamlesi Rn'yi azaltmaz,
   * Ra'yı en fazla 2 azaltır; diğer hamleler Rn ya da Ra'yı en fazla 1 azaltır. Bu yüzden
   * X = Rn + Ra/2 her hamlede en fazla 1 düşer ve hedefte X ≤ F olur → alt sınır ⌈X − F⌉.
   * Ayrıca ⌈(R−F)/2⌉ de geçerlidir; ikisinin büyüğü alınır. Tabanı eksik sabit renkler
   * (pembe, kahverengi, gri) için boş şişeye dökme gerekir ve bu dökme X'i azaltmaz.
   * Her hamle sınırı en fazla 1 düşürür (tutarlı).
   */
  estimate(keys: readonly string[]): number {
    let runs = 0;
    let primaryRuns = 0;
    let units = 0;
    const bottoms = new Map<string, number>();
    for (const key of keys) {
      if (key.length === 0) continue;
      const st = this.stats(key);
      runs += st.runs;
      primaryRuns += st.primaryRuns;
      units += key.length;
      bottoms.set(st.bottom, (bottoms.get(st.bottom) ?? 0) + 1);
    }
    const filled = Math.ceil(units / this.capacity);
    const excess = Math.max(0, runs - filled);
    let needBottom = 0;
    for (const [c, n] of this.totals) {
      if (this.fixedOnly && !FIXED_CODES.has(c)) continue;
      needBottom += Math.max(0, Math.ceil(n / this.capacity) - (bottoms.get(c) ?? 0));
    }
    if (!this.mix) return excess + needBottom;
    const weighted = Math.ceil(runs - primaryRuns + primaryRuns / 2 - filled);
    return Math.max(Math.ceil(excess / 2), weighted) + needBottom;
  }
}

export function heuristic(state: GameState): number {
  const keys = state.bottles.map(bottleKey);
  return new HeuristicContext(keys, state.capacity, state.rules.mix).estimate(keys);
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
    if (state.bottles[to]!.length === 0) {
      // Boş şişeler birbirinin aynısıdır: yalnızca ilkine dökmek yeter.
      if (to !== firstEmpty) continue;
      // Tek renkli şişeyi bütünüyle boş şişeye dökmek durumu değiştirmez.
      const g = topGroup(state.bottles[from]!);
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

  const bottleCache = new Map<string, Bottle>();
  const toBottle = (key: string): Bottle => {
    let b = bottleCache.get(key);
    if (!b) {
      b = bottleFromKey(key);
      bottleCache.set(key, b);
    }
    return b;
  };

  const startKeys = start.bottles.map(bottleKey);
  const hctx = new HeuristicContext(startKeys, start.capacity, start.rules.mix);
  const nodeKeys: string[] = [startKeys.join('|')];
  const parents: number[] = [-1];
  const moveFrom: number[] = [-1];
  const moveTo: number[] = [-1];
  const gs: number[] = [0];
  const canonical = (keys: readonly string[]) => keys.slice().sort().join('|');
  const best = new Map<string, number>([[canonical(startKeys), 0]]);
  const heap = new MinHeap();
  // Öncelik: f, eşitlikte daha derin düğüm önce.
  const SCALE = 4096;
  heap.push(weight * hctx.estimate(startKeys) * SCALE, 0);
  let expanded = 0;

  while (heap.size > 0) {
    const node = heap.pop()!;
    const g = gs[node]!;
    const keys = nodeKeys[node]!.split('|');
    if ((best.get(canonical(keys)) ?? Infinity) < g) continue;
    const state: GameState = { ...start, bottles: keys.map(toBottle), moves: g };
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
      const childKeys = keys.slice();
      childKeys[from] = bottleKey(next.bottles[from]!);
      childKeys[to] = bottleKey(next.bottles[to]!);
      const ck = canonical(childKeys);
      const ng = g + 1;
      if ((best.get(ck) ?? Infinity) <= ng) continue;
      best.set(ck, ng);
      const id = nodeKeys.length;
      nodeKeys.push(childKeys.join('|'));
      parents.push(node);
      moveFrom.push(from);
      moveTo.push(to);
      gs.push(ng);
      const f = ng + weight * hctx.estimate(childKeys);
      heap.push(f * SCALE - ng, id);
    }
  }
  return { status: 'unsolvable', expanded };
}
