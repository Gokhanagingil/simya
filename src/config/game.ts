/**
 * Oyunun değiştirilebilir sayıları (TASARIM B5, B6). Tüm ekonomi ve yıldız ayarları buradadır.
 */

export const STAR_THRESHOLDS = {
  /** Normal bölüm: 3★ ≤ ⌈en iyi × 1,15⌉, 2★ ≤ ⌈en iyi × 1,5⌉ */
  normal: { three: 1.15, two: 1.5 },
  /** Sisli bölüm: oyuncu gizli birimleri bilmediği için daha esnek. */
  fog: { three: 1.4, two: 1.8 },
} as const;

/** Ücretli bir güç kullanılan bölümde alınabilecek en yüksek yıldız. */
export const MAX_STARS_WITH_PAID_POWER = 2;

export const ECONOMY = {
  startDust: 100,
  reward: {
    firstClear: 10,
    perNewStar: 5,
    firstPerfect: 15,
    roomComplete: 50,
  },
  cost: {
    /** Her bölüm denemesinde bu kadar geri alma ücretsizdir. */
    freeUndos: 3,
    undo: 5,
    hint: 20,
    extraBottle: 30,
    fogClear: 15,
  },
  /** Bölüm denemesi başına en fazla ekstra şişe. */
  extraBottlesPerLevel: 1,
} as const;

/** İpucu çözücüsünün süre sınırı (ms). */
export const HINT_TIME_LIMIT_MS = 2500;

/** Dökme animasyonu süresi (ms). Yavaş animasyonda × 1,5. TASARIM: 500–700 ms. */
export const POUR_DURATION_MS = 640;
export const SLOW_ANIMATION_FACTOR = 1.5;

/** Geçersiz şişeye dokunulunca açıklama bu kadar kez gösterilir. */
export const INVALID_TAP_HINT_COUNT = 3;
