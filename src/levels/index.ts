import room1 from './room1.json';
import room2 from './room2.json';
import room3 from './room3.json';
import { LEVEL_SCHEMA_VERSION, type LevelDef } from './schema';

function load(raw: unknown): LevelDef[] {
  const list = raw as LevelDef[];
  for (const l of list) {
    if (l.schemaVersion !== LEVEL_SCHEMA_VERSION) {
      throw new Error(`${l.id}: desteklenmeyen bölüm şeması ${l.schemaVersion}`);
    }
  }
  return list;
}

export const LEVELS: readonly LevelDef[] = [...load(room1), ...load(room2), ...load(room3)];

export const LEVEL_BY_ID: ReadonlyMap<string, LevelDef> = new Map(LEVELS.map((l) => [l.id, l]));

export function levelsOfRoom(room: number): LevelDef[] {
  return LEVELS.filter((l) => l.room === room).sort((a, b) => a.index - b.index);
}

export function getLevel(id: string): LevelDef | undefined {
  return LEVEL_BY_ID.get(id);
}

export { levelId } from './schema';
export type { LevelDef } from './schema';
