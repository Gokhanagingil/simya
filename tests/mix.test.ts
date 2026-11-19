import { describe, expect, it } from 'vitest';
import {
  applyMove,
  emptyHistory,
  getValidTargets,
  mixColors,
  mixIngredients,
  mixPreview,
  pushHistory,
  undo,
} from '../src/engine';
import { board, codes } from './helpers';

const M = ['classic', 'mix'] as const;

describe('karışım tablosu', () => {
  it.each([
    ['red', 'yellow', 'orange'],
    ['yellow', 'red', 'orange'],
    ['yellow', 'blue', 'green'],
    ['blue', 'yellow', 'green'],
    ['red', 'blue', 'purple'],
    ['blue', 'red', 'purple'],
  ] as const)('%s + %s = %s', (a, b, c) => {
    expect(mixColors(a, b)).toBe(c);
  });

  it('aynı renk ya da ikincil renkler karışmaz', () => {
    expect(mixColors('red', 'red')).toBeNull();
    expect(mixColors('orange', 'blue')).toBeNull();
    expect(mixColors('green', 'purple')).toBeNull();
    expect(mixColors('pink', 'red')).toBeNull();
  });

  it('ikincil rengin bileşenleri bilinir', () => {
    expect(mixIngredients('green')).toEqual(['blue', 'yellow']);
    expect(mixIngredients('red')).toBeNull();
  });
});

describe('karışım dökmesi', () => {
  it('1 kırmızı 2 sarının üstüne dökülünce 3 turuncu olur (miktar korunur)', () => {
    const s = board(['r', 'byy', ''], [...M]);
    const { state, events } = applyMove(s, 0, 1);
    expect(codes(state)).toEqual(['', 'booo', '']);
    expect(events.map((e) => e.type)).toEqual(['pour', 'mix']);
    expect(events[1]).toMatchObject({ type: 'mix', start: 1, count: 3, result: 'orange' });
  });

  it('karışım dolu tek renkli şişe oluşturursa tamamlanır', () => {
    const s = board(['rr', 'yy', ''], [...M]);
    const { state, events } = applyMove(s, 0, 1);
    expect(codes(state)).toEqual(['', 'oooo', '']);
    expect(events.at(-1)).toMatchObject({ type: 'complete', color: 'orange' });
  });

  it('karışım renkleri bir daha karışmaz', () => {
    const s = board(['r', 'o', 'g'], [...M]);
    expect(getValidTargets(s, 0)).toEqual([]);
    const s2 = board(['o', 'r'], [...M]);
    expect(getValidTargets(s2, 0)).toEqual([]);
  });

  it('aynı ana renk normal dökülür', () => {
    const s = board(['r', 'yr'], [...M]);
    expect(codes(applyMove(s, 0, 1).state)).toEqual(['', 'yrr']);
  });

  it('karışım altında aynı renk varsa birleşip tek grup olur', () => {
    const s = board(['b', 'gy'], [...M]);
    const { state } = applyMove(s, 0, 1);
    expect(codes(state)).toEqual(['', 'ggg']);
  });

  it('yer azsa yalnızca sığan kadar dökülür ve karışır, miktar korunur', () => {
    const s = board(['rrr', 'byy'], [...M]);
    const before = s.bottles.flat().length;
    const { state } = applyMove(s, 0, 1);
    expect(codes(state)).toEqual(['rr', 'booo']);
    expect(state.bottles.flat().length).toBe(before);
  });

  it('karışım yalnızca bölümde etkinse çalışır', () => {
    const s = board(['r', 'y'], ['classic']);
    expect(getValidTargets(s, 0)).toEqual([]);
  });

  it('önizleme sonuç rengini gösterir', () => {
    const s = board(['r', 'b', 'r', ''], [...M]);
    expect(mixPreview(s, 0, 1)).toBe('purple');
    expect(mixPreview(s, 0, 2)).toBeNull();
    expect(mixPreview(s, 0, 3)).toBeNull();
  });

  it('karışım yalnızca geri al ile geri alınır', () => {
    const s0 = board(['r', 'y', ''], [...M]);
    const h = pushHistory(emptyHistory, s0);
    applyMove(s0, 0, 1);
    expect(codes(undo(h)!.state)).toEqual(['r', 'y', '']);
  });
});
