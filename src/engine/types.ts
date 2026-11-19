/**
 * Oyun motorunun veri tipleri.
 * Motor saf ve deterministiktir: arayüzden, zamandan ve rastgelelikten bağımsızdır.
 * Şişeler alttan üste dizilir: bottle[0] en alttaki birimdir.
 */

export const COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'brown',
  'gray',
] as const;

export type Color = (typeof COLORS)[number];

/** Karışım odasındaki ana renkler. */
export const PRIMARY_COLORS = ['red', 'yellow', 'blue'] as const;
export type PrimaryColor = (typeof PRIMARY_COLORS)[number];

export interface Unit {
  readonly color: Color;
  /** Sis mekaniği: gizli birim "?" deseniyle görünür ve dökülemez. */
  readonly hidden: boolean;
}

export type Bottle = readonly Unit[];

/**
 * Mekanik kimlikleri. Yeni mekanikler (mühürlü şişe, donmuş katman, hamle sınırı,
 * raf düzeni, huni) buraya eklenir ve `mechanics/` altında bir kural modülüyle bağlanır.
 */
export type MechanicId = 'classic' | 'fog' | 'mix';

export interface RuleFlags {
  readonly fog: boolean;
  readonly mix: boolean;
}

export interface GameState {
  readonly capacity: number;
  readonly rules: RuleFlags;
  readonly bottles: readonly Bottle[];
  /** Bu bölümde yapılan dökme sayısı (geri alma bir azaltır). */
  readonly moves: number;
}

export type Move = readonly [from: number, to: number];

export type MoveEvent =
  | {
      readonly type: 'pour';
      readonly from: number;
      readonly to: number;
      readonly color: Color;
      readonly amount: number;
      /** Kaynakta dökülen ilk birimin (alttan) sırası. */
      readonly fromStart: number;
      /** Hedefte dökülen ilk birimin (alttan) sırası. */
      readonly toStart: number;
    }
  | {
      readonly type: 'mix';
      readonly bottle: number;
      /** Karışan grubun alttan başlangıç sırası. */
      readonly start: number;
      readonly count: number;
      readonly sourceColor: Color;
      readonly targetColor: Color;
      readonly result: Color;
    }
  | {
      readonly type: 'reveal';
      readonly bottle: number;
      readonly index: number;
      readonly color: Color;
    }
  | {
      readonly type: 'complete';
      readonly bottle: number;
      readonly color: Color;
    };

export interface MoveResult {
  readonly state: GameState;
  readonly events: readonly MoveEvent[];
}
