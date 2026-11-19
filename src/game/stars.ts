import { MAX_STARS_WITH_PAID_POWER, STAR_THRESHOLDS } from '../config/game';

export interface StarInput {
  moves: number;
  optimal: number;
  fog: boolean;
  usedPaidPower: boolean;
}

export interface StarResult {
  stars: 1 | 2 | 3;
  perfect: boolean;
}

/** 3★ için gereken en fazla hamle. */
export function threeStarLimit(optimal: number, fog: boolean): number {
  const t = fog ? STAR_THRESHOLDS.fog : STAR_THRESHOLDS.normal;
  return Math.ceil(optimal * t.three - 1e-9);
}

export function twoStarLimit(optimal: number, fog: boolean): number {
  const t = fog ? STAR_THRESHOLDS.fog : STAR_THRESHOLDS.normal;
  return Math.ceil(optimal * t.two - 1e-9);
}

export function computeStars({ moves, optimal, fog, usedPaidPower }: StarInput): StarResult {
  let stars: 1 | 2 | 3 = 1;
  if (moves <= threeStarLimit(optimal, fog)) stars = 3;
  else if (moves <= twoStarLimit(optimal, fog)) stars = 2;
  if (usedPaidPower && stars > MAX_STARS_WITH_PAID_POWER) stars = MAX_STARS_WITH_PAID_POWER as 2;
  // Ücretli güçle (ör. ekstra şişe, ipucu) kusursuz çözüm sayılmaz.
  const perfect = !usedPaidPower && moves <= optimal;
  return { stars, perfect };
}
