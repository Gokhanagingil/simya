import type { GameState } from './types';

/**
 * Geri alma geçmişi. Durumlar küçük olduğu için tam anlık görüntü saklanır;
 * bu, geri almanın her mekanikte (karışım, sis) kesin doğru olmasını sağlar.
 */
export interface History {
  readonly past: readonly GameState[];
}

export const emptyHistory: History = { past: [] };

export function pushHistory(history: History, state: GameState, limit = 500): History {
  const past = [...history.past, state];
  return { past: past.length > limit ? past.slice(past.length - limit) : past };
}

export function canUndo(history: History): boolean {
  return history.past.length > 0;
}

export function undo(history: History): { history: History; state: GameState } | null {
  const prev = history.past[history.past.length - 1];
  if (!prev) return null;
  return { history: { past: history.past.slice(0, -1) }, state: prev };
}

/**
 * Gizli birimler hiç yer değiştirmez (dökülemezler ve altlarındaki birimler de
 * hareket edemez). Bu yüzden bir birim açığa çıktığında aynı konum geçmişteki tüm
 * durumlarda da açılabilir: geri alma, açılmış bir birimi tekrar gizlemez.
 */
export function revealInHistory(
  history: History,
  reveals: readonly { bottle: number; index: number }[],
): History {
  if (reveals.length === 0) return history;
  return {
    past: history.past.map((state) => {
      let changed = false;
      const bottles = state.bottles.map((bottle, b) => {
        const hits = reveals.filter((r) => r.bottle === b);
        if (hits.length === 0) return bottle;
        return bottle.map((u, i) => {
          if (u.hidden && hits.some((r) => r.index === i)) {
            changed = true;
            return { color: u.color, hidden: false };
          }
          return u;
        });
      });
      return changed ? { ...state, bottles } : state;
    }),
  };
}

/** Ekstra şişe geri almayla kaybolmasın diye geçmişteki her duruma da eklenir. */
export function addBottleToHistory(history: History): History {
  return { past: history.past.map((s) => ({ ...s, bottles: [...s.bottles, []] })) };
}
