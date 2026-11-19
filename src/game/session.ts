/**
 * Bir bölüm denemesinin saf durum makinesi: hamle, geri alma, yeniden başlama ve güçler.
 * Toz harcaması burada hesaplanır ama bakiye uygulama deposunda tutulur.
 */
import { ECONOMY } from '../config/game';
import {
  addBottleToHistory,
  addEmptyBottle,
  applyMove,
  canonicalKey,
  hiddenCount,
  isStuck,
  isWon,
  revealBottle,
  revealInHistory,
  type GameState,
  type MoveEvent,
} from '../engine';
import { stateFromLevel } from '../levels/difficulty';
import type { LevelDef } from '../levels/schema';
import type { ActiveLevel } from './save';

export interface Session {
  readonly level: LevelDef;
  readonly state: GameState;
  readonly past: readonly GameState[];
  readonly undosUsed: number;
  readonly usedPaidPower: boolean;
  readonly extraBottles: number;
  readonly hintsUsed: number;
}

export function startSession(level: LevelDef): Session {
  return {
    level,
    state: stateFromLevel(level),
    past: [],
    undosUsed: 0,
    usedPaidPower: false,
    extraBottles: 0,
    hintsUsed: 0,
  };
}

export function resumeSession(level: LevelDef, active: ActiveLevel): Session {
  // Kayıttaki durum bu bölüme ait değilse (ör. bölüm paketi değiştiyse) baştan başlanır.
  const fresh = stateFromLevel(level);
  const sameUnits =
    active.state.capacity === fresh.capacity &&
    active.state.bottles.flat().length === fresh.bottles.flat().length &&
    active.state.bottles.length >= fresh.bottles.length;
  if (!sameUnits || active.levelId !== level.id) return startSession(level);
  return {
    level,
    state: active.state,
    past: active.past,
    undosUsed: active.undosUsed,
    usedPaidPower: active.usedPaidPower,
    extraBottles: active.extraBottles,
    hintsUsed: active.hintsUsed,
  };
}

export function toActive(s: Session): ActiveLevel {
  return {
    levelId: s.level.id,
    state: s.state,
    past: [...s.past],
    undosUsed: s.undosUsed,
    usedPaidPower: s.usedPaidPower,
    extraBottles: s.extraBottles,
    hintsUsed: s.hintsUsed,
  };
}

export function sessionMove(
  s: Session,
  from: number,
  to: number,
): { session: Session; events: readonly MoveEvent[] } {
  const { state, events } = applyMove(s.state, from, to);
  let history: { readonly past: readonly GameState[] } = { past: [...s.past, s.state] };
  const reveals = events.flatMap((e) =>
    e.type === 'reveal' ? [{ bottle: e.bottle, index: e.index }] : [],
  );
  history = revealInHistory(history, reveals);
  return { session: { ...s, state, past: history.past }, events };
}

/** Sıradaki geri almanın bedeli (0 = ücretsiz). */
export function undoCost(s: Session): number {
  return s.undosUsed < ECONOMY.cost.freeUndos ? 0 : ECONOMY.cost.undo;
}

export function freeUndosLeft(s: Session): number {
  return Math.max(0, ECONOMY.cost.freeUndos - s.undosUsed);
}

export function canUndo(s: Session): boolean {
  return s.past.length > 0;
}

export function sessionUndo(s: Session): Session | null {
  const prev = s.past[s.past.length - 1];
  if (!prev) return null;
  const paid = undoCost(s) > 0;
  return {
    ...s,
    state: prev,
    past: s.past.slice(0, -1),
    undosUsed: s.undosUsed + 1,
    usedPaidPower: s.usedPaidPower || paid,
  };
}

/** Yeniden başla: her zaman ücretsiz, yeni bir deneme sayılır. */
export function sessionRestart(s: Session): Session {
  return startSession(s.level);
}

export function canAddBottle(s: Session): boolean {
  return s.extraBottles < ECONOMY.extraBottlesPerLevel;
}

export function sessionAddBottle(s: Session): Session {
  return {
    ...s,
    state: addEmptyBottle(s.state),
    past: addBottleToHistory({ past: s.past }).past,
    extraBottles: s.extraBottles + 1,
    usedPaidPower: true,
  };
}

export function sessionRevealBottle(
  s: Session,
  index: number,
): { session: Session; events: readonly MoveEvent[] } {
  const { state, events } = revealBottle(s.state, index);
  if (events.length === 0) return { session: s, events };
  const reveals = events.flatMap((e) =>
    e.type === 'reveal' ? [{ bottle: e.bottle, index: e.index }] : [],
  );
  return {
    session: {
      ...s,
      state,
      past: revealInHistory({ past: s.past }, reveals).past,
      usedPaidPower: true,
    },
    events,
  };
}

export function sessionHintUsed(s: Session): Session {
  return { ...s, hintsUsed: s.hintsUsed + 1, usedPaidPower: true };
}

export const sessionWon = (s: Session) => isWon(s.state);
export const sessionStuck = (s: Session) => isStuck(s.state);
export const fogLeft = (s: Session) => hiddenCount(s.state);

/**
 * Oyuncu saklı çözüm yolundaysa sıradaki hamleyi doğrudan verir (çözücüye gerek kalmaz).
 * Yol üstünde olmak = şişelerin sırası dahil aynı durum.
 */
export function hintFromStoredSolution(s: Session): readonly [number, number] | null {
  const key = (st: GameState) => st.bottles.map((b) => b.map((u) => u.color).join(',')).join('|');
  let st = stateFromLevel(s.level);
  if (st.bottles.length !== s.state.bottles.length) return null;
  const target = key(s.state);
  for (const move of s.level.solution) {
    if (key(st) === target) return move;
    st = applyMove(st, move[0], move[1]).state;
  }
  return null;
}

export { canonicalKey };
