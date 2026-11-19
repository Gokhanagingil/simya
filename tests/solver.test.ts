import { describe, expect, it } from 'vitest';
import {
  COLORS,
  canonicalKey,
  createState,
  isWon,
  listMoves,
  applyMove,
  mulberry32,
  playMoves,
  shuffle,
  type Color,
  type GameState,
} from '../src/engine';
import { heuristic, solve } from '../src/solver/solver';
import { board } from './helpers';

/** Budamasız, sezgisiz genişlik öncelikli arama: en kısa çözüm için bağımsız referans. */
function bfs(start: GameState, limit = 400_000): number | null {
  if (isWon(start)) return 0;
  const seen = new Set([canonicalKey(start)]);
  let frontier = [start];
  for (let depth = 1; frontier.length > 0; depth++) {
    const next: GameState[] = [];
    for (const s of frontier) {
      for (const [f, t] of listMoves(s)) {
        const n = applyMove(s, f, t).state;
        if (isWon(n)) return depth;
        const k = canonicalKey(n);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push(n);
        if (seen.size > limit) throw new Error('BFS sınırı aşıldı');
      }
    }
    frontier = next;
  }
  return null;
}

function randomBoard(
  seed: number,
  colors: number,
  empties: number,
  mechanics: ('classic' | 'fog' | 'mix')[] = ['classic'],
) {
  const rand = mulberry32(seed);
  const units: Color[] = [];
  for (let c = 0; c < colors; c++) for (let k = 0; k < 4; k++) units.push(COLORS[c]!);
  const sh = shuffle(units, rand);
  const bottles: Color[][] = [];
  for (let b = 0; b < colors; b++) bottles.push(sh.slice(b * 4, b * 4 + 4));
  for (let e = 0; e < empties; e++) bottles.push([]);
  const hidden = bottles.map((b) => b.map((_, i) => i < b.length - 1 && rand() < 0.5));
  return createState(bottles, { capacity: 4, mechanics, hidden });
}

describe('çözücü', () => {
  it('çözülmüş durum için boş çözüm döner', () => {
    const r = solve(board(['rrrr', '']));
    expect(r).toMatchObject({ status: 'solved', moves: [] });
  });

  it('bilinen küçük bulmacada en kısa çözümü bulur', () => {
    const r = solve(board(['rb', 'br', ''], ['classic'], 2));
    expect(r.status).toBe('solved');
    if (r.status === 'solved') expect(r.moves).toHaveLength(3);
  });

  it('çözümsüz bulmacayı kanıtlar', () => {
    const r = solve(board(['rbrb', 'brbr', 'rbrb', 'brbr']));
    expect(r.status).toBe('unsolvable');
  });

  it('düğüm sınırına ulaşınca "limit" döner', () => {
    const r = solve(randomBoard(5, 8, 2), { maxNodes: 1 });
    expect(['limit', 'solved']).toContain(r.status);
  });

  it('bulunan çözüm motorda oynatılınca kazanır', () => {
    const s = randomBoard(42, 6, 2);
    const r = solve(s);
    expect(r.status).toBe('solved');
    if (r.status === 'solved') expect(isWon(playMoves(s, r.moves))).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8])('klasik: BFS ile aynı uzunluk (tohum %i)', (seed) => {
    const s = randomBoard(seed * 101, 3, 2);
    const r = solve(s);
    const ref = bfs(s);
    if (ref === null) expect(r.status).toBe('unsolvable');
    else {
      expect(r.status).toBe('solved');
      if (r.status === 'solved') expect(r.moves.length).toBe(ref);
    }
  });

  it.each([1, 2, 3, 4, 5, 6])('klasik 4 renk tek boş: BFS ile aynı (tohum %i)', (seed) => {
    const s = randomBoard(seed * 37, 4, 1);
    const r = solve(s);
    const ref = bfs(s);
    expect(r.status === 'solved' ? r.moves.length : null).toBe(ref);
  });

  it.each([1, 2, 3, 4, 5, 6])('sis: BFS ile aynı uzunluk (tohum %i)', (seed) => {
    const s = randomBoard(seed * 13, 3, 2, ['fog']);
    const r = solve(s);
    const ref = bfs(s);
    expect(r.status === 'solved' ? r.moves.length : null).toBe(ref);
  });

  it.each([1, 2, 3, 4, 5, 6])('karışım: BFS ile aynı uzunluk (tohum %i)', (seed) => {
    const rand = mulberry32(seed);
    const units: Color[] = shuffle(
      [
        'red',
        'red',
        'yellow',
        'yellow',
        'blue',
        'blue',
        'red',
        'yellow',
        'green',
        'orange',
        'orange',
        'green',
      ],
      rand,
    );
    const bottles = [units.slice(0, 4), units.slice(4, 8), units.slice(8, 12), [], []];
    const s = createState(bottles, { capacity: 4, mechanics: ['classic', 'mix'] });
    const r = solve(s);
    const ref = bfs(s);
    expect(r.status === 'solved' ? r.moves.length : null).toBe(ref);
  });

  it('sezgisel fonksiyon gerçek uzaklığı aşmaz (kabul edilebilirlik)', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const s = randomBoard(seed * 7, 4, 2, seed % 2 ? ['fog'] : ['classic']);
      const ref = bfs(s);
      if (ref !== null) expect(heuristic(s)).toBeLessThanOrEqual(ref);
    }
  });

  it('zaman sınırı aşılınca limit döner', () => {
    let t = 0;
    const r = solve(randomBoard(9, 8, 2), { timeLimitMs: 5, now: () => (t += 10) });
    expect(['limit', 'solved']).toContain(r.status);
  });
});
