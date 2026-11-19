import { createState, type Color, type GameState, type MechanicId } from '../src/engine';

const CODE: Record<string, Color> = {
  r: 'red',
  o: 'orange',
  y: 'yellow',
  g: 'green',
  b: 'blue',
  p: 'purple',
  k: 'pink',
  n: 'brown',
  a: 'gray',
};

/**
 * Kısa yazımla durum kurar: "rrb" = alttan kırmızı, kırmızı, mavi.
 * Büyük harf gizli birimdir: "Rrb" → alttaki kırmızı gizli.
 */
export function board(
  spec: string[],
  mechanics: MechanicId[] = ['classic'],
  capacity = 4,
): GameState {
  const bottles = spec.map((s) => [...s].map((ch) => CODE[ch.toLowerCase()]!));
  const hidden = spec.map((s) => [...s].map((ch) => ch !== ch.toLowerCase()));
  return createState(bottles, { capacity, mechanics, hidden });
}

export function codes(state: GameState): string[] {
  const rev = Object.fromEntries(Object.entries(CODE).map(([k, v]) => [v, k]));
  return state.bottles.map((b) =>
    b.map((u) => (u.hidden ? rev[u.color]!.toUpperCase() : rev[u.color]!)).join(''),
  );
}
