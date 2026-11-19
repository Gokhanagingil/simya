import { describe, expect, it } from 'vitest';
import { createSave, migrate, parseSave, SAVE_VERSION, serialize } from '../src/game/save';

describe('kayıt', () => {
  it('yeni kayıt 100 tozla başlar ve sürümlüdür', () => {
    const s = createSave();
    expect(s.dust).toBe(100);
    expect(s.version).toBe(SAVE_VERSION);
    expect(s.settings.music).toBe(false);
    expect(s.settings.symbols).toBe(true);
  });

  it('serileştirme gidiş-dönüş kayıpsızdır', () => {
    const s = { ...createSave(), dust: 245, materials: ['su', 'ates'] };
    expect(migrate(JSON.parse(serialize(s)))).toEqual(s);
  });

  it('sürüm 0 (sürüm alanı olmayan) kayıt göç ettirilir', () => {
    const old = {
      dust: 55,
      levels: { 'oda1-b01': { best: 4, stars: 3, perfect: true, completions: 2 } },
    };
    const m = migrate(old);
    expect(m.version).toBe(SAVE_VERSION);
    expect(m.dust).toBe(55);
    expect(m.levels['oda1-b01']).toEqual({ best: 4, stars: 3, perfect: true, completions: 2 });
    expect(m.settings.textSize).toBe('normal');
  });

  it('bozuk alanlar güvenli değerlere çekilir', () => {
    const m = migrate({
      version: 1,
      dust: 'çok',
      levels: { x: { stars: 9 }, y: 'bozuk' },
      settings: { textSize: 'dev' },
    });
    expect(m.dust).toBe(100);
    expect(m.levels.x!.stars).toBe(3);
    expect(m.levels.y).toBeUndefined();
    expect(m.settings.textSize).toBe('normal');
  });

  it('bozuk ana kayıtta yedek kullanılır, ikisi de bozuksa temiz başlanır', () => {
    const good = serialize({ ...createSave(), dust: 77 });
    expect(parseSave('{bozuk', good)).toMatchObject({
      outcome: 'recovered-backup',
      save: { dust: 77 },
    });
    expect(parseSave('{bozuk', '[]').outcome).toBe('recovered-reset');
    expect(parseSave(null, null).outcome).toBe('fresh');
    expect(parseSave(good, null).outcome).toBe('loaded');
  });

  it('gelecekteki bilinmeyen sürüm yedeğe düşer', () => {
    expect(parseSave(JSON.stringify({ version: 99 }), null).outcome).toBe('recovered-reset');
  });
});
