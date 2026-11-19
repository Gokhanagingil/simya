import type { Color, MechanicId, Move } from '../engine';

/** Bölüm dosyası şeması. Şema değişirse sürüm artırılır ve yükleyici eski sürümü dönüştürür. */
export const LEVEL_SCHEMA_VERSION = 1;

export interface LevelReward {
  /** Bu bölüm ilk kez tamamlanınca kazanılan malzemeler (simya masasında kullanılır). */
  readonly materials?: readonly string[];
}

export interface LevelDef {
  readonly schemaVersion: number;
  readonly id: string;
  readonly room: number;
  readonly index: number;
  readonly seed: number;
  readonly capacity: number;
  readonly mechanics: readonly MechanicId[];
  /** Şişeler alttan üste. */
  readonly bottles: readonly (readonly Color[])[];
  readonly hidden: readonly (readonly boolean[])[];
  /** Çözücünün kanıtladığı en kısa çözüm uzunluğu. */
  readonly optimalMoves: number;
  readonly solution: readonly Move[];
  /** 0 (çok kolay) – 1 (çok zor). Ayrıntı: docs/ZORLUK.md */
  readonly difficulty: number;
  readonly reward: LevelReward;
}

export function levelId(room: number, index: number): string {
  return `oda${room}-b${String(index).padStart(2, '0')}`;
}
