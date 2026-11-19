import { describe, expect, it } from 'vitest';
import { ECONOMY } from '../src/config/game';
import { isWon } from '../src/engine';
import {
  canAddBottle,
  freeUndosLeft,
  hintFromStoredSolution,
  resumeSession,
  sessionAddBottle,
  sessionMove,
  sessionRestart,
  sessionRevealBottle,
  sessionUndo,
  startSession,
  toActive,
  undoCost,
} from '../src/game/session';
import { getLevel, levelsOfRoom } from '../src/levels';

const L = getLevel('oda1-b05')!;
const FOG = levelsOfRoom(2)[4]!;

describe('bölüm oturumu', () => {
  it('ilk 3 geri alma ücretsiz, sonra 5 toz ve ücretli güç sayılır', () => {
    let s = startSession(L);
    for (const [f, t] of L.solution.slice(0, 5)) s = sessionMove(s, f, t).session;
    for (let i = 0; i < ECONOMY.cost.freeUndos; i++) {
      expect(undoCost(s)).toBe(0);
      s = sessionUndo(s)!;
    }
    expect(freeUndosLeft(s)).toBe(0);
    expect(s.usedPaidPower).toBe(false);
    expect(undoCost(s)).toBe(ECONOMY.cost.undo);
    s = sessionUndo(s)!;
    expect(s.usedPaidPower).toBe(true);
    expect(s.state.moves).toBe(1);
  });

  it('yeniden başla yeni bir deneme açar (ücretsiz, haklar sıfırlanır)', () => {
    let s = startSession(L);
    s = sessionMove(s, L.solution[0]![0], L.solution[0]![1]).session;
    s = sessionAddBottle(s);
    s = sessionRestart(s);
    expect(s.state.moves).toBe(0);
    expect(s.usedPaidPower).toBe(false);
    expect(canAddBottle(s)).toBe(true);
    expect(s.state.bottles).toHaveLength(L.bottles.length);
  });

  it('ekstra şişe bölüm başına bir kez, geri almayla kaybolmaz', () => {
    let s = startSession(L);
    s = sessionMove(s, L.solution[0]![0], L.solution[0]![1]).session;
    s = sessionAddBottle(s);
    expect(canAddBottle(s)).toBe(false);
    s = sessionUndo(s)!;
    expect(s.state.bottles).toHaveLength(L.bottles.length + 1);
  });

  it('sis kaldır seçilen şişeyi açar ve geri almayla tekrar gizlenmez', () => {
    let s = startSession(FOG);
    const idx = s.state.bottles.findIndex((b) => b.some((u) => u.hidden));
    const [f, t] = FOG.solution[0]!;
    s = sessionMove(s, f, t).session;
    s = sessionRevealBottle(s, idx).session;
    expect(s.state.bottles[idx]!.some((u) => u.hidden)).toBe(false);
    s = sessionUndo(s)!;
    expect(s.state.bottles[idx]!.some((u) => u.hidden)).toBe(false);
    expect(s.usedPaidPower).toBe(true);
  });

  it('saklı çözüm yolundayken ipucu yoldan verilir', () => {
    let s = startSession(L);
    expect(hintFromStoredSolution(s)).toEqual(L.solution[0]);
    s = sessionMove(s, L.solution[0]![0], L.solution[0]![1]).session;
    expect(hintFromStoredSolution(s)).toEqual(L.solution[1]);
  });

  it('kayıttan devam eden oturum aynı durumdan sürer ve çözülebilir', () => {
    let s = startSession(L);
    for (const [f, t] of L.solution.slice(0, 3)) s = sessionMove(s, f, t).session;
    const r = resumeSession(L, JSON.parse(JSON.stringify(toActive(s))));
    expect(r.state).toEqual(s.state);
    let end = r;
    for (const [f, t] of L.solution.slice(3)) end = sessionMove(end, f, t).session;
    expect(isWon(end.state)).toBe(true);
  });

  it('başka bölüme ait kayıt yeni oturum başlatır', () => {
    const other = toActive(startSession(getLevel('oda1-b02')!));
    expect(resumeSession(L, other).state.moves).toBe(0);
  });
});
