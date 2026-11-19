/**
 * İlerleme kuralları: kilitler, bölüm tamamlama ödülleri, "Devam Et" hedefi.
 * Saf fonksiyonlar; kayıt nesnesini değiştirmez, yenisini döndürür.
 */
import { ECONOMY } from '../config/game';
import { ROOMS, type RoomDef } from '../config/rooms';
import { levelsOfRoom, type LevelDef } from '../levels';
import { levelId } from '../levels/schema';
import type { LevelRecord, SaveData } from './save';
import { computeStars } from './stars';

export function isRoomUnlocked(save: SaveData, room: number): boolean {
  const def = ROOMS.find((r) => r.id === room);
  if (!def) return false;
  if (def.key === null) return true;
  const prev = ROOMS.find((r) => r.id === room - 1);
  if (!prev) return false;
  const lastPrev = levelId(prev.id, prev.levelCount);
  return Boolean(save.levels[lastPrev]?.completions) && save.materials.includes(def.key);
}

/** Önceki odanın son bölümü bitti ama anahtar madde henüz keşfedilmedi mi? */
export function awaitingKey(save: SaveData): RoomDef | null {
  for (const room of ROOMS) {
    if (room.key === null || isRoomUnlocked(save, room.id)) continue;
    const prev = ROOMS.find((r) => r.id === room.id - 1);
    if (prev && save.levels[levelId(prev.id, prev.levelCount)]?.completions) return room;
    return null;
  }
  return null;
}

export function isLevelUnlocked(save: SaveData, level: Pick<LevelDef, 'room' | 'index'>): boolean {
  if (!isRoomUnlocked(save, level.room)) return false;
  if (level.index === 1) return true;
  return Boolean(save.levels[levelId(level.room, level.index - 1)]?.completions);
}

export function isCompleted(save: SaveData, id: string): boolean {
  return Boolean(save.levels[id]?.completions);
}

/** "Devam Et" düğmesinin açacağı bölüm: yarım bölüm, yoksa ilk tamamlanmamış açık bölüm. */
export function continueTarget(
  save: SaveData,
): { kind: 'level'; id: string } | { kind: 'key'; room: RoomDef } | { kind: 'done' } {
  if (save.active) return { kind: 'level', id: save.active.levelId };
  for (const room of ROOMS) {
    if (!isRoomUnlocked(save, room.id)) {
      const waiting = awaitingKey(save);
      if (waiting) return { kind: 'key', room: waiting };
      break;
    }
    const next = levelsOfRoom(room.id).find((l) => !isCompleted(save, l.id));
    if (next) return { kind: 'level', id: next.id };
  }
  return { kind: 'done' };
}

export function totalStars(save: SaveData): number {
  return Object.values(save.levels).reduce((n, r) => n + r.stars, 0);
}

export function totalPerfect(save: SaveData): number {
  return Object.values(save.levels).filter((r) => r.perfect).length;
}

export function roomStars(save: SaveData, room: number): { stars: number; max: number } {
  const list = levelsOfRoom(room);
  return {
    stars: list.reduce((n, l) => n + (save.levels[l.id]?.stars ?? 0), 0),
    max: list.length * 3,
  };
}

export interface CompletionInput {
  level: LevelDef;
  moves: number;
  usedPaidPower: boolean;
  usedExtraBottle: boolean;
}

export interface CompletionResult {
  save: SaveData;
  moves: number;
  optimal: number;
  usedPaidPower: boolean;
  usedExtraBottle: boolean;
  stars: 1 | 2 | 3;
  perfect: boolean;
  firstClear: boolean;
  newStars: number;
  firstPerfect: boolean;
  /** Önceki rekor (varsa) ve kaç hamle geliştirildiği. */
  previousBest: number | null;
  improvedBy: number;
  newRecord: boolean;
  dustEarned: number;
  dustBreakdown: { firstClear: number; stars: number; perfect: number; room: number };
  materials: string[];
  roomCompleted: number | null;
}

export function completeLevel(save: SaveData, input: CompletionInput): CompletionResult {
  const { level, moves, usedPaidPower, usedExtraBottle } = input;
  const fog = level.mechanics.includes('fog');
  const { stars, perfect } = computeStars({
    moves,
    optimal: level.optimalMoves,
    fog,
    usedPaidPower,
  });
  const prev: LevelRecord = save.levels[level.id] ?? {
    best: null,
    stars: 0,
    perfect: false,
    completions: 0,
  };
  const firstClear = prev.completions === 0;
  const newStars = Math.max(0, stars - prev.stars);
  const firstPerfect = perfect && !prev.perfect;

  const counts = !usedExtraBottle;
  const previousBest = prev.best;
  const newRecord = counts && previousBest !== null && moves < previousBest;
  const improvedBy = newRecord ? previousBest! - moves : 0;
  const best = counts
    ? previousBest === null
      ? moves
      : Math.min(previousBest, moves)
    : previousBest;

  const R = ECONOMY.reward;
  const breakdown = {
    firstClear: firstClear ? R.firstClear : 0,
    stars: newStars * R.perNewStar,
    perfect: firstPerfect ? R.firstPerfect : 0,
    room: 0,
  };

  const materials = firstClear
    ? (level.reward.materials ?? []).filter((m) => !save.materials.includes(m))
    : [];

  let roomCompleted: number | null = null;
  const roomLevels = levelsOfRoom(level.room);
  const levelsAfter = {
    ...save.levels,
    [level.id]: {
      best,
      stars: Math.max(prev.stars, stars) as LevelRecord['stars'],
      perfect: prev.perfect || perfect,
      completions: prev.completions + 1,
    },
  };
  if (
    !save.roomsCompleted.includes(level.room) &&
    roomLevels.every((l) => levelsAfter[l.id]?.completions)
  ) {
    roomCompleted = level.room;
    breakdown.room = R.roomComplete;
  }
  const dustEarned = breakdown.firstClear + breakdown.stars + breakdown.perfect + breakdown.room;

  const next: SaveData = {
    ...save,
    dust: save.dust + dustEarned,
    levels: levelsAfter,
    active: save.active?.levelId === level.id ? null : save.active,
    materials: [...save.materials, ...materials],
    roomsCompleted: roomCompleted ? [...save.roomsCompleted, roomCompleted] : save.roomsCompleted,
    story:
      roomCompleted && !save.story.includes(`oda${roomCompleted}`)
        ? [...save.story, `oda${roomCompleted}`]
        : save.story,
  };

  return {
    save: next,
    moves,
    optimal: level.optimalMoves,
    usedPaidPower,
    usedExtraBottle,
    stars,
    perfect,
    firstClear,
    newStars,
    firstPerfect,
    previousBest,
    improvedBy,
    newRecord,
    dustEarned,
    dustBreakdown: breakdown,
    materials,
    roomCompleted,
  };
}

export function nextLevelId(level: Pick<LevelDef, 'room' | 'index'>): string | null {
  const room = ROOMS.find((r) => r.id === level.room);
  if (!room) return null;
  if (level.index < room.levelCount) return levelId(level.room, level.index + 1);
  const nextRoom = ROOMS.find((r) => r.id === level.room + 1);
  return nextRoom ? levelId(nextRoom.id, 1) : null;
}
