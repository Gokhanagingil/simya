import type { SymbolId } from '../config/palette';

/** Renk sembolleri: merkez (0,0), yarıçap ~1 birimlik koordinatlarda çizilir. */
export function symbolPath(id: SymbolId): string {
  switch (id) {
    case 'circle':
      return 'M0,-0.82 A0.82,0.82 0 1 1 0,0.82 A0.82,0.82 0 1 1 0,-0.82 Z';
    case 'triangle':
      return 'M0,-0.95 L0.92,0.72 L-0.92,0.72 Z';
    case 'star':
      return 'M0,-1 L0.24,-0.33 L0.95,-0.31 L0.39,0.13 L0.59,0.81 L0,0.41 L-0.59,0.81 L-0.39,0.13 L-0.95,-0.31 L-0.24,-0.33 Z';
    case 'diamond':
      return 'M0,-1 L0.78,0 L0,1 L-0.78,0 Z';
    case 'square':
      return 'M-0.74,-0.74 H0.74 V0.74 H-0.74 Z';
    case 'hexagon':
      return 'M0,-0.9 L0.78,-0.45 L0.78,0.45 L0,0.9 L-0.78,0.45 L-0.78,-0.45 Z';
    case 'heart':
      return 'M0,0.88 C-0.5,0.5 -0.98,0.12 -0.98,-0.3 C-0.98,-0.72 -0.55,-0.95 -0.25,-0.85 C-0.1,-0.8 0,-0.66 0,-0.56 C0,-0.66 0.1,-0.8 0.25,-0.85 C0.55,-0.95 0.98,-0.72 0.98,-0.3 C0.98,0.12 0.5,0.5 0,0.88 Z';
    case 'plus':
      return 'M-0.28,-0.9 H0.28 V-0.28 H0.9 V0.28 H0.28 V0.9 H-0.28 V0.28 H-0.9 V-0.28 H-0.28 Z';
    case 'wave':
      return 'M-0.95,-0.2 C-0.6,-0.7 -0.3,-0.7 0,-0.2 C0.3,0.3 0.6,0.3 0.95,-0.2 L0.95,0.35 C0.6,0.85 0.3,0.85 0,0.35 C-0.3,-0.15 -0.6,-0.15 -0.95,0.35 Z';
  }
}

export function ColorSymbol({
  id,
  cx,
  cy,
  r,
  fill,
}: {
  id: SymbolId;
  cx: number;
  cy: number;
  r: number;
  fill: string;
}) {
  return <path d={symbolPath(id)} transform={`translate(${cx} ${cy}) scale(${r})`} fill={fill} />;
}
