import type { MechanicId } from '../engine';

export interface RoomDef {
  readonly id: number;
  /** Bu odayı açan anahtar madde (önceki odanın sonunda keşfedilir). */
  readonly key: string | null;
  /** Odada tanıtılan yeni mekanik. */
  readonly mechanic: MechanicId;
  readonly levelCount: number;
}

export const ROOMS: readonly RoomDef[] = [
  { id: 1, key: null, mechanic: 'classic', levelCount: 20 },
  { id: 2, key: 'sis', mechanic: 'fog', levelCount: 20 },
  { id: 3, key: 'prizma', mechanic: 'mix', levelCount: 20 },
];
