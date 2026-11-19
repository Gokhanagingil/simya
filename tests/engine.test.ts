import { describe, expect, it } from 'vitest';
import {
  addBottleToHistory,
  addEmptyBottle,
  applyMove,
  canonicalKey,
  emptyHistory,
  getValidTargets,
  InvalidMoveError,
  isComplete,
  isSelectable,
  isStuck,
  isWon,
  pushHistory,
  undo,
} from '../src/engine';
import { board, codes } from './helpers';

describe('klasik kurallar: dökme miktarı', () => {
  it('üst renk grubunun tamamı, yer varsa dökülür', () => {
    const s = board(['brr', 'b', '']);
    const { state } = applyMove(s, 0, 2);
    expect(codes(state)).toEqual(['b', 'b', 'rr']);
  });

  it('hedefte yer azsa yalnızca sığan kadar dökülür', () => {
    const s = board(['rrr', 'brr', '']);
    const { state, events } = applyMove(s, 0, 1);
    expect(codes(state)).toEqual(['rr', 'brrr', '']);
    expect(events[0]).toMatchObject({ type: 'pour', amount: 1, fromStart: 2, toStart: 3 });
  });

  it('aynı renkli ama ardışık olmayan birimler dökülmez', () => {
    const s = board(['rbr', '', '']);
    const { state } = applyMove(s, 0, 1);
    expect(codes(state)).toEqual(['rb', 'r', '']);
  });

  it('her dökme bir hamle sayar', () => {
    let s = board(['rb', 'rb', '', '']);
    s = applyMove(s, 0, 2).state;
    s = applyMove(s, 1, 2).state;
    expect(s.moves).toBe(2);
  });
});

describe('geçerli hedefler', () => {
  it('boş şişe ve üst rengi aynı olan şişe geçerlidir', () => {
    const s = board(['br', 'yr', 'yb', '']);
    expect(getValidTargets(s, 0)).toEqual([1, 3]);
  });

  it('dolu şişe ve kendisi hedef olamaz', () => {
    const s = board(['br', 'rrbr', '']);
    expect(getValidTargets(s, 0)).toEqual([2]);
  });

  it('farklı renk üstüne dökme geçersizdir ve hata fırlatır', () => {
    const s = board(['r', 'b', '']);
    expect(() => applyMove(s, 0, 1)).toThrow(InvalidMoveError);
  });

  it('boş şişe kaynak olarak seçilemez', () => {
    const s = board(['', 'r']);
    expect(isSelectable(s, 0)).toBe(false);
    expect(getValidTargets(s, 0)).toEqual([]);
  });
});

describe('tamamlanan şişe', () => {
  it('dolu ve tek renkli şişe tamamlanır, olay üretilir', () => {
    const s = board(['rrr', 'br', '']);
    const { state, events } = applyMove(s, 1, 0);
    expect(isComplete(state.bottles[0]!, 4)).toBe(true);
    expect(events.map((e) => e.type)).toEqual(['pour', 'complete']);
  });

  it('tamamlanmış şişe seçilemez ve hedef olamaz', () => {
    const s = board(['rrrr', 'b', '']);
    expect(isSelectable(s, 0)).toBe(false);
    expect(getValidTargets(s, 1)).toEqual([2]);
  });

  it('dolu ama karışık şişe tamamlanmış sayılmaz', () => {
    expect(isComplete(board(['rrrb'])!.bottles[0]!, 4)).toBe(false);
  });
});

describe('kazanma ve kilitlenme', () => {
  it('tüm şişeler boş ya da tamamsa kazanılır', () => {
    expect(isWon(board(['rrrr', '', 'bbbb']))).toBe(true);
    expect(isWon(board(['rrr', 'r', 'bbbb']))).toBe(false);
  });

  it('geçerli hamle kalmadıysa kilitlenme', () => {
    const s = board(['rbrb', 'brbr', 'rbrb', 'brbr']);
    expect(isStuck(s)).toBe(true);
  });

  it('kazanılmış durum kilitlenme sayılmaz', () => {
    expect(isStuck(board(['rrrr', 'bbbb']))).toBe(false);
  });

  it('hamle varsa kilitlenme yoktur', () => {
    expect(isStuck(board(['rbrb', 'brb', 'rbrb', 'brbr']))).toBe(false);
  });
});

describe('geri alma geçmişi', () => {
  it('geri alma önceki durumu ve hamle sayısını geri getirir', () => {
    const s0 = board(['rb', 'b', '']);
    let h = emptyHistory;
    h = pushHistory(h, s0);
    const s1 = applyMove(s0, 0, 1).state;
    expect(s1.moves).toBe(1);
    const r = undo(h)!;
    expect(r.state).toEqual(s0);
    expect(r.state.moves).toBe(0);
    expect(undo(r.history)).toBeNull();
  });

  it('ekstra şişe geri almayla kaybolmaz', () => {
    const s0 = board(['rb', 'br']);
    const h = pushHistory(emptyHistory, s0);
    const h2 = addBottleToHistory(h);
    const r = undo(h2)!;
    expect(r.state.bottles).toHaveLength(3);
    expect(addEmptyBottle(s0).bottles).toHaveLength(3);
  });

  it('geçmiş sınırı aşılınca en eski kayıt düşer', () => {
    let h = emptyHistory;
    const s = board(['r']);
    for (let i = 0; i < 10; i++) h = pushHistory(h, { ...s, moves: i }, 5);
    expect(h.past).toHaveLength(5);
    expect(h.past[0]!.moves).toBe(5);
  });
});

describe('motor saflığı', () => {
  it('applyMove girdiyi değiştirmez', () => {
    const s = board(['rb', 'b', '']);
    const before = JSON.stringify(s);
    applyMove(s, 0, 1);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('kanonik anahtar şişe sırasından bağımsızdır', () => {
    expect(canonicalKey(board(['rb', 'b', '']))).toBe(canonicalKey(board(['', 'b', 'rb'])));
  });
});
