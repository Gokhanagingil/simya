import { describe, expect, it } from 'vitest';
import {
  applyMove,
  emptyHistory,
  getValidTargets,
  hiddenCount,
  pushHistory,
  revealBottle,
  revealInHistory,
  topGroup,
  undo,
} from '../src/engine';
import { board, codes } from './helpers';

describe('sis mekaniği', () => {
  it('şişenin en üst birimi her zaman görünür', () => {
    const s = board(['RBY'], ['fog']);
    expect(codes(s)).toEqual(['RBy']);
  });

  it('gizli birimler üst gruba dahil edilmez ve dökülmez', () => {
    const s = board(['RRr', '', ''], ['fog']);
    expect(topGroup(s.bottles[0]!)).toMatchObject({ color: 'red', count: 1 });
    const { state } = applyMove(s, 0, 1);
    expect(codes(state)).toEqual(['Rr', 'r', '']);
  });

  it('gizli birim en üste gelince açığa çıkar ve olay üretilir', () => {
    const s = board(['BRy', 'y', ''], ['fog']);
    const { state, events } = applyMove(s, 0, 1);
    expect(codes(state)).toEqual(['Br', 'yy', '']);
    expect(events).toContainEqual({ type: 'reveal', bottle: 0, index: 1, color: 'red' });
  });

  it('sis kapalıyken gizli bayrağı yok sayılır', () => {
    const s = board(['RRr', ''], ['classic']);
    expect(codes(s)).toEqual(['rrr', '']);
  });

  it('gizli birimin rengi hedef geçerliliğini etkilemez (üst görünür renk esastır)', () => {
    const s = board(['Bb', 'Rb', ''], ['fog']);
    expect(getValidTargets(s, 0)).toEqual([1, 2]);
  });

  it('tamamlanan şişedeki gizli birimler de açılır', () => {
    const s = board(['RRr', 'Br', ''], ['fog']);
    const { state, events } = applyMove(s, 1, 0);
    expect(codes(state)[0]).toBe('rrrr');
    expect(events.filter((e) => e.type === 'reveal' && e.bottle === 0)).toHaveLength(2);
    expect(events.at(-1)).toMatchObject({ type: 'complete', bottle: 0 });
  });

  it('sis kaldır gücü seçilen şişedeki tüm gizli birimleri açar', () => {
    const s = board(['RBy', 'Gg'], ['fog']);
    const { state, events } = revealBottle(s, 0);
    expect(codes(state)).toEqual(['rby', 'Gg']);
    expect(events).toHaveLength(2);
    expect(hiddenCount(state)).toBe(1);
    expect(state.moves).toBe(0);
  });

  it('açığa çıkan birim geri almayla tekrar gizlenmez', () => {
    const s0 = board(['BRy', 'y', ''], ['fog']);
    let h = pushHistory(emptyHistory, s0);
    const { events } = applyMove(s0, 0, 1);
    const reveals = events.flatMap((e) => (e.type === 'reveal' ? [e] : []));
    h = revealInHistory(h, reveals);
    const back = undo(h)!.state;
    expect(codes(back)).toEqual(['Bry', 'y', '']);
  });
});
