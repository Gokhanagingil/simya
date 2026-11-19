/**
 * Oyun kurallarının TEK kaynağı. Oyun ekranı, ipucu çözücüsü ve bölüm üretici
 * aynı işlevleri kullanır.
 */
import { mixColors } from './mix';
import type {
  Bottle,
  Color,
  GameState,
  MechanicId,
  Move,
  MoveEvent,
  MoveResult,
  RuleFlags,
  Unit,
} from './types';

export interface TopGroup {
  readonly color: Color;
  /** Grubun alttan başlangıç sırası. */
  readonly start: number;
  readonly count: number;
}

export function rulesFromMechanics(mechanics: readonly MechanicId[]): RuleFlags {
  return { fog: mechanics.includes('fog'), mix: mechanics.includes('mix') };
}

export function createState(
  bottles: readonly (readonly Color[])[],
  options: {
    capacity: number;
    mechanics?: readonly MechanicId[];
    hidden?: readonly (readonly boolean[])[];
  },
): GameState {
  const rules = rulesFromMechanics(options.mechanics ?? ['classic']);
  const built: Bottle[] = bottles.map((colors, b) =>
    colors.map((color, i) => ({
      color,
      hidden: rules.fog && Boolean(options.hidden?.[b]?.[i]),
    })),
  );
  // Değişmez: şişenin en üst birimi her zaman görünür.
  const normalized = built.map((bottle) => revealTop(bottle));
  return { capacity: options.capacity, rules, bottles: normalized, moves: 0 };
}

function revealTop(bottle: Bottle): Bottle {
  const top = bottle[bottle.length - 1];
  if (!top || !top.hidden) return bottle;
  return [...bottle.slice(0, -1), { color: top.color, hidden: false }];
}

/** Dolu ve tek renkli şişe tamamlanmıştır (gizli birimler gerçek renkleriyle sayılır). */
export function isComplete(bottle: Bottle, capacity: number): boolean {
  if (bottle.length !== capacity || capacity === 0) return false;
  const first = bottle[0]!.color;
  return bottle.every((u) => u.color === first);
}

/** Kaynağın en üstündeki görünür, aynı renkli ve ardışık birimler. */
export function topGroup(bottle: Bottle): TopGroup | null {
  const top = bottle[bottle.length - 1];
  if (!top || top.hidden) return null;
  let start = bottle.length - 1;
  while (start > 0) {
    const below = bottle[start - 1]!;
    if (below.hidden || below.color !== top.color) break;
    start--;
  }
  return { color: top.color, start, count: bottle.length - start };
}

export function freeSpace(state: GameState, index: number): number {
  return state.capacity - (state.bottles[index]?.length ?? state.capacity);
}

/** Şişe kaynak olarak seçilebilir mi? (boş ve tamamlanmış şişeler seçilemez) */
export function isSelectable(state: GameState, index: number): boolean {
  const bottle = state.bottles[index];
  if (!bottle || bottle.length === 0) return false;
  if (isComplete(bottle, state.capacity)) return false;
  return topGroup(bottle) !== null;
}

export type PourKind = 'pour' | 'mix';

/** Dökme geçerliyse türünü, değilse `null` döndürür. */
export function pourKind(state: GameState, from: number, to: number): PourKind | null {
  if (from === to) return null;
  if (!isSelectable(state, from)) return null;
  const target = state.bottles[to];
  if (!target) return null;
  if (isComplete(target, state.capacity)) return null;
  if (target.length >= state.capacity) return null;
  if (target.length === 0) return 'pour';
  const src = topGroup(state.bottles[from]!)!;
  const dst = topGroup(target);
  if (!dst) return null;
  if (dst.color === src.color) return 'pour';
  if (state.rules.mix && mixColors(src.color, dst.color)) return 'mix';
  return null;
}

export function canPour(state: GameState, from: number, to: number): boolean {
  return pourKind(state, from, to) !== null;
}

export function getValidTargets(state: GameState, from: number): number[] {
  const result: number[] = [];
  for (let to = 0; to < state.bottles.length; to++) {
    if (canPour(state, from, to)) result.push(to);
  }
  return result;
}

/** Karışım önizlemesi: kaynak bu hedefe dökülürse oluşacak renk (karışım değilse `null`). */
export function mixPreview(state: GameState, from: number, to: number): Color | null {
  if (pourKind(state, from, to) !== 'mix') return null;
  const src = topGroup(state.bottles[from]!)!;
  const dst = topGroup(state.bottles[to]!)!;
  return mixColors(src.color, dst.color);
}

export function listMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  for (let from = 0; from < state.bottles.length; from++) {
    if (!isSelectable(state, from)) continue;
    for (let to = 0; to < state.bottles.length; to++) {
      if (canPour(state, from, to)) moves.push([from, to]);
    }
  }
  return moves;
}

export class InvalidMoveError extends Error {
  constructor(from: number, to: number) {
    super(`Geçersiz hamle: ${from} → ${to}`);
    this.name = 'InvalidMoveError';
  }
}

/**
 * Hamleyi uygular; yeni durumu ve animasyon olaylarını döndürür.
 * Olay sırası: pour → mix → reveal → complete.
 */
export function applyMove(state: GameState, from: number, to: number): MoveResult {
  const kind = pourKind(state, from, to);
  if (!kind) throw new InvalidMoveError(from, to);
  const events: MoveEvent[] = [];
  const bottles = state.bottles.slice() as Bottle[];
  const source = bottles[from]!;
  const target = bottles[to]!;
  const group = topGroup(source)!;
  const amount = Math.min(group.count, state.capacity - target.length);
  const fromStart = source.length - amount;
  const toStart = target.length;

  let newSource: Bottle = source.slice(0, fromStart);
  const poured: Unit[] = Array.from({ length: amount }, () => ({
    color: group.color,
    hidden: false,
  }));
  let newTarget: Bottle = [...target, ...poured];
  events.push({ type: 'pour', from, to, color: group.color, amount, fromStart, toStart });

  if (kind === 'mix') {
    const dst = topGroup(target)!;
    const result = mixColors(group.color, dst.color)!;
    const mixStart = dst.start;
    newTarget = newTarget.map((u, i) => (i >= mixStart ? { color: result, hidden: false } : u));
    events.push({
      type: 'mix',
      bottle: to,
      start: mixStart,
      count: newTarget.length - mixStart,
      sourceColor: group.color,
      targetColor: dst.color,
      result,
    });
  }

  // Sis: kaynağın yeni üst birimi gizliyse kalıcı olarak açığa çıkar.
  const newTop = newSource[newSource.length - 1];
  if (newTop && newTop.hidden) {
    newSource = revealTop(newSource);
    events.push({ type: 'reveal', bottle: from, index: newSource.length - 1, color: newTop.color });
  }

  if (isComplete(newTarget, state.capacity)) {
    // Mühürlenen şişedeki gizli birimler de görünür olur.
    newTarget.forEach((u, i) => {
      if (u.hidden) events.push({ type: 'reveal', bottle: to, index: i, color: u.color });
    });
    newTarget = newTarget.map((u) => (u.hidden ? { color: u.color, hidden: false } : u));
    events.push({ type: 'complete', bottle: to, color: newTarget[0]!.color });
  }

  bottles[from] = newSource;
  bottles[to] = newTarget;
  return { state: { ...state, bottles, moves: state.moves + 1 }, events };
}

export function isWon(state: GameState): boolean {
  return state.bottles.every((b) => b.length === 0 || isComplete(b, state.capacity));
}

export function hasAnyMove(state: GameState): boolean {
  for (let from = 0; from < state.bottles.length; from++) {
    if (!isSelectable(state, from)) continue;
    for (let to = 0; to < state.bottles.length; to++) {
      if (canPour(state, from, to)) return true;
    }
  }
  return false;
}

/** Kazanılmamış ve hiç geçerli hamle yoksa kilitlenmiştir. */
export function isStuck(state: GameState): boolean {
  return !isWon(state) && !hasAnyMove(state);
}

/** Ekstra boş şişe gücü: tahtanın sonuna boş bir şişe ekler. Hamle sayılmaz. */
export function addEmptyBottle(state: GameState): GameState {
  return { ...state, bottles: [...state.bottles, []] };
}

/** Sis kaldır gücü: seçilen şişedeki tüm gizli birimleri açar. Hamle sayılmaz. */
export function revealBottle(state: GameState, index: number): MoveResult {
  const bottle = state.bottles[index];
  if (!bottle) return { state, events: [] };
  const events: MoveEvent[] = [];
  bottle.forEach((u, i) => {
    if (u.hidden) events.push({ type: 'reveal', bottle: index, index: i, color: u.color });
  });
  if (events.length === 0) return { state, events };
  const bottles = state.bottles.slice();
  bottles[index] = bottle.map((u) => ({ color: u.color, hidden: false }));
  return { state: { ...state, bottles }, events };
}

export function hiddenCount(state: GameState, index?: number): number {
  const list = index === undefined ? state.bottles : [state.bottles[index] ?? []];
  return list.reduce((sum, b) => sum + b.filter((u) => u.hidden).length, 0);
}

/** Bir dizi hamleyi sırayla oynatır (doğrulama ve testler için). */
export function playMoves(state: GameState, moves: readonly Move[]): GameState {
  return moves.reduce((s, [from, to]) => applyMove(s, from, to).state, state);
}

/** Durumu şişe sırasından bağımsız bir anahtara çevirir (çözücü ve ipucu için). */
export function bottleKey(bottle: Bottle): string {
  let key = '';
  for (const u of bottle) {
    const code = COLOR_CODES[u.color];
    key += u.hidden ? code.toUpperCase() : code;
  }
  return key;
}

const COLOR_CODES: Readonly<Record<Color, string>> = {
  red: 'r',
  orange: 'o',
  yellow: 'y',
  green: 'g',
  blue: 'b',
  purple: 'p',
  pink: 'k',
  brown: 'n',
  gray: 'a',
};

export function canonicalKey(state: GameState): string {
  return state.bottles.map(bottleKey).sort().join('|');
}
