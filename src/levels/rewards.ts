import type { LevelReward } from './schema';

/**
 * Bölüm ödülleri (malzemeler). Tarif ağacı ve kilit mantığı: docs/TARIFLER.md
 * Oda anahtarının son malzemesi odanın sonunda gelir; böylece anahtar oda bitince keşfedilir.
 */
export const ROOM_REWARDS: Record<number, Record<number, LevelReward>> = {
  1: {
    1: { materials: ['su', 'ates'] },
    10: { materials: ['toprak'] },
    20: { materials: ['hava'] },
  },
  2: {
    10: { materials: ['tuz'] },
  },
  3: {
    10: { materials: ['civa'] },
  },
};
