import type { Color } from '../engine';

/**
 * Sıvı paleti. Tonlar; yaşla azalan mavi duyarlılığı ve renk körlüğü türleri düşünülerek,
 * birbirinden uzak açıklık/ton değerleriyle seçildi. Mavi parlak ve orta tonda; mor kırmızıya
 * yakın (eflatun) tutuldu ki mavi–mor karışmasın. Testler: tests/palette.test.ts (CIEDE2000).
 * Bilgi asla yalnızca renkle verilmez: her rengin bir sembolü var.
 */
export interface Swatch {
  readonly fill: string;
  /** Sıvının üst kenarındaki parlak ton. */
  readonly light: string;
  /** Sembolün rengi (sıvı üstünde ≥ 3:1). */
  readonly ink: string;
  readonly symbol: SymbolId;
}

export type SymbolId =
  'circle' | 'triangle' | 'star' | 'diamond' | 'square' | 'hexagon' | 'heart' | 'plus' | 'wave';

export const PALETTE: Readonly<Record<Color, Swatch>> = {
  red: { fill: '#e33b45', light: '#f06d75', ink: '#2a0708', symbol: 'circle' },
  orange: { fill: '#f28a1c', light: '#f9ab55', ink: '#2e1500', symbol: 'triangle' },
  yellow: { fill: '#f6d23a', light: '#fbe57e', ink: '#3a2c00', symbol: 'star' },
  green: { fill: '#4cb944', light: '#7fd277', ink: '#06250a', symbol: 'diamond' },
  blue: { fill: '#3b8cf0', light: '#79b1f6', ink: '#041b3a', symbol: 'square' },
  purple: { fill: '#b858cf', light: '#cd88e0', ink: '#22052f', symbol: 'hexagon' },
  pink: { fill: '#ff9ccb', light: '#ffc4e0', ink: '#4a0d2a', symbol: 'heart' },
  brown: { fill: '#8e6a50', light: '#ad8b71', ink: '#f6ece2', symbol: 'plus' },
  gray: { fill: '#c3c7cc', light: '#e1e3e6', ink: '#1d2127', symbol: 'wave' },
};

/** Şişe camının iç rengi (sıvılar bunun üstünde ≥ 3:1 kontrastla görünür). */
export const GLASS_INTERIOR = '#241f1d';
/** Gizli (sisli) birim. */
export const FOG_FILL = '#5d5866';
export const FOG_INK = '#f2eee6';
