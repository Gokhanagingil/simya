import type { GameState, Move } from '../engine';
import { solve } from './solver';

export type HintResult = { kind: 'move'; move: Move } | { kind: 'none' } | { kind: 'timeout' };

/**
 * Mevcut durumdan sıradaki iyi hamle. Önce süre sınırlı en kısa çözüm aranır; bulunamazsa
 * daha hızlı (ağırlıklı) arama ile geçerli bir çözüm yolu denenir.
 */
export function computeHint(
  state: GameState,
  timeLimitMs: number,
  now: () => number = () => Date.now(),
): HintResult {
  const exact = solve(state, { timeLimitMs: timeLimitMs * 0.6, maxNodes: 600_000, now });
  if (exact.status === 'solved')
    return exact.moves[0] ? { kind: 'move', move: exact.moves[0] } : { kind: 'none' };
  if (exact.status === 'unsolvable') return { kind: 'none' };
  const fast = solve(state, { timeLimitMs: timeLimitMs * 0.4, maxNodes: 600_000, weight: 3, now });
  if (fast.status === 'solved' && fast.moves[0]) return { kind: 'move', move: fast.moves[0] };
  if (fast.status === 'unsolvable') return { kind: 'none' };
  return { kind: 'timeout' };
}
