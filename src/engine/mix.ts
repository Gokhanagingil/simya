import type { Color, PrimaryColor } from './types';
import { PRIMARY_COLORS } from './types';

/** Karışım tablosu: iki farklı ana renk → ikincil renk. */
const MIX_TABLE: Readonly<Record<string, Color>> = {
  'red+yellow': 'orange',
  'blue+yellow': 'green',
  'blue+red': 'purple',
};

export function isPrimary(color: Color): color is PrimaryColor {
  return (PRIMARY_COLORS as readonly Color[]).includes(color);
}

/** İki farklı ana rengin karışımını döndürür; karışmıyorsa `null`. */
export function mixColors(a: Color, b: Color): Color | null {
  if (a === b) return null;
  // Sıcak döngüde (çözücü) çağrıldığı için dizi/sıralama kullanmadan.
  const key = a < b ? `${a}+${b}` : `${b}+${a}`;
  return MIX_TABLE[key] ?? null;
}

/** Bir ikincil rengin hangi iki ana renkten oluştuğu (öğretim ve testler için). */
export function mixIngredients(color: Color): readonly [PrimaryColor, PrimaryColor] | null {
  for (const [key, value] of Object.entries(MIX_TABLE)) {
    if (value === color) {
      const [a, b] = key.split('+') as [PrimaryColor, PrimaryColor];
      return [a, b];
    }
  }
  return null;
}
