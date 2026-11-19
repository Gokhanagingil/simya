/**
 * Kayıt şeması (sürümlü) ve göçler. Kayıt bozuksa uygulama çökmez: yedek kayıt ya da
 * temiz bir başlangıç kullanılır.
 */
import { ECONOMY } from '../config/game';
import type { GameState } from '../engine';

export const SAVE_VERSION = 1;

export type TextSize = 'normal' | 'large' | 'xlarge';

export interface Settings {
  textSize: TextSize;
  symbols: boolean;
  sound: boolean;
  music: boolean;
  /** 0–1 */
  volume: number;
  vibration: boolean;
  slowAnimation: boolean;
}

export interface LevelRecord {
  /** Kişisel rekor (en az hamle). Ekstra şişeyle yapılan çözümler rekora sayılmaz. */
  best: number | null;
  stars: 0 | 1 | 2 | 3;
  perfect: boolean;
  completions: number;
}

/** Yarım kalan bölüm: uygulama kapansa da tam kaldığı yerden devam edilir. */
export interface ActiveLevel {
  levelId: string;
  state: GameState;
  past: GameState[];
  undosUsed: number;
  usedPaidPower: boolean;
  extraBottles: number;
  hintsUsed: number;
}

export interface SaveData {
  version: typeof SAVE_VERSION;
  createdAt: string;
  updatedAt: string;
  dust: number;
  levels: Record<string, LevelRecord>;
  active: ActiveLevel | null;
  /** Sahip olunan malzemeler (temel + keşfedilen maddeler). */
  materials: string[];
  /** Keşif sırası (simya masasında bulunan maddeler). */
  discoveries: string[];
  /** Simya masasında art arda başarısız deneme sayısı. */
  failStreak: number;
  /** Açılan hikâye sayfaları. */
  story: string[];
  /** Tamamlanan odalar (oda bonusu bir kez verilir). */
  roomsCompleted: number[];
  /** Kilit açılış sahnesi gösterilen odalar. */
  roomsAnnounced: number[];
  /** Bir kez gösterilen bağlamsal yardımlar ve tanıtım kartları. */
  seen: string[];
  tutorialDone: boolean;
  introSeen: boolean;
  invalidTapHints: number;
  settings: Settings;
  /** Geliştirici menüsü açıldı mı (yalnızca sürüme 7 dokunuşla). */
  devUnlocked: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  textSize: 'normal',
  symbols: true,
  sound: true,
  music: false,
  volume: 0.6,
  vibration: true,
  slowAnimation: false,
};

export function createSave(now = new Date()): SaveData {
  const iso = now.toISOString();
  return {
    version: SAVE_VERSION,
    createdAt: iso,
    updatedAt: iso,
    dust: ECONOMY.startDust,
    levels: {},
    active: null,
    materials: [],
    discoveries: [],
    failStreak: 0,
    story: [],
    roomsCompleted: [],
    roomsAnnounced: [1],
    seen: [],
    tutorialDone: false,
    introSeen: false,
    invalidTapHints: 0,
    settings: { ...DEFAULT_SETTINGS },
    devUnlocked: false,
  };
}

/**
 * Göç tablosu: MIGRATIONS[n] sürüm n'deki kaydı n+1'e taşır.
 * Yeni sürümde alan eklenince buraya bir adım eklenir ve SAVE_VERSION artırılır.
 * Sürüm 0: sürüm alanı olmayan, erken geliştirme kayıtları (yalnızca ilerleme alanları).
 */
type AnyRecord = Record<string, unknown>;
export const MIGRATIONS: Record<number, (old: AnyRecord) => AnyRecord> = {
  0: (old) => ({ ...old, version: 1 }),
};

function isObject(v: unknown): v is AnyRecord {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function asNumberArray(v: unknown): number[] {
  return Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number') : [];
}

function sanitizeRecord(v: unknown): LevelRecord | null {
  if (!isObject(v)) return null;
  const stars = typeof v.stars === 'number' ? Math.max(0, Math.min(3, Math.round(v.stars))) : 0;
  return {
    best: typeof v.best === 'number' && v.best > 0 ? v.best : null,
    stars: stars as LevelRecord['stars'],
    perfect: v.perfect === true,
    completions: typeof v.completions === 'number' ? Math.max(0, v.completions) : 0,
  };
}

function sanitizeState(v: unknown): GameState | null {
  if (!isObject(v) || !Array.isArray(v.bottles) || typeof v.capacity !== 'number') return null;
  if (!isObject(v.rules)) return null;
  const bottles = v.bottles.map((b) =>
    Array.isArray(b)
      ? b.filter(isObject).map((u) => ({
          color: u.color as GameState['bottles'][number][number]['color'],
          hidden: u.hidden === true,
        }))
      : [],
  );
  return {
    capacity: v.capacity,
    rules: { fog: v.rules.fog === true, mix: v.rules.mix === true },
    bottles,
    moves: typeof v.moves === 'number' ? v.moves : 0,
  };
}

function sanitizeActive(v: unknown): ActiveLevel | null {
  if (!isObject(v) || typeof v.levelId !== 'string') return null;
  const state = sanitizeState(v.state);
  if (!state) return null;
  const past = Array.isArray(v.past)
    ? v.past.map(sanitizeState).filter((s): s is GameState => s !== null)
    : [];
  return {
    levelId: v.levelId,
    state,
    past,
    undosUsed: typeof v.undosUsed === 'number' ? v.undosUsed : 0,
    usedPaidPower: v.usedPaidPower === true,
    extraBottles: typeof v.extraBottles === 'number' ? v.extraBottles : 0,
    hintsUsed: typeof v.hintsUsed === 'number' ? v.hintsUsed : 0,
  };
}

function sanitizeSettings(v: unknown): Settings {
  const s = isObject(v) ? v : {};
  const textSize: TextSize =
    s.textSize === 'large' || s.textSize === 'xlarge' ? s.textSize : 'normal';
  const bool = (x: unknown, d: boolean) => (typeof x === 'boolean' ? x : d);
  return {
    textSize,
    symbols: bool(s.symbols, DEFAULT_SETTINGS.symbols),
    sound: bool(s.sound, DEFAULT_SETTINGS.sound),
    music: bool(s.music, DEFAULT_SETTINGS.music),
    volume:
      typeof s.volume === 'number' ? Math.max(0, Math.min(1, s.volume)) : DEFAULT_SETTINGS.volume,
    vibration: bool(s.vibration, DEFAULT_SETTINGS.vibration),
    slowAnimation: bool(s.slowAnimation, DEFAULT_SETTINGS.slowAnimation),
  };
}

/** Herhangi bir (eski ya da kısmen bozuk) kayıt nesnesini güncel şemaya getirir. */
export function migrate(raw: unknown): SaveData {
  if (!isObject(raw)) throw new Error('Kayıt nesne değil');
  let data: AnyRecord = raw;
  let version = typeof data.version === 'number' ? data.version : 0;
  if (version > SAVE_VERSION) throw new Error(`Bilinmeyen kayıt sürümü: ${version}`);
  while (version < SAVE_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) throw new Error(`Göç adımı yok: ${version}`);
    data = step(data);
    version = data.version as number;
  }
  const base = createSave();
  const levels: Record<string, LevelRecord> = {};
  if (isObject(data.levels)) {
    for (const [id, rec] of Object.entries(data.levels)) {
      const r = sanitizeRecord(rec);
      if (r) levels[id] = r;
    }
  }
  return {
    ...base,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : base.createdAt,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : base.updatedAt,
    dust:
      typeof data.dust === 'number' && Number.isFinite(data.dust)
        ? Math.max(0, Math.floor(data.dust))
        : base.dust,
    levels,
    active: sanitizeActive(data.active),
    materials: asStringArray(data.materials),
    discoveries: asStringArray(data.discoveries),
    failStreak: typeof data.failStreak === 'number' ? data.failStreak : 0,
    story: asStringArray(data.story),
    roomsCompleted: asNumberArray(data.roomsCompleted),
    roomsAnnounced: asNumberArray(data.roomsAnnounced).length
      ? asNumberArray(data.roomsAnnounced)
      : [1],
    seen: asStringArray(data.seen),
    tutorialDone: data.tutorialDone === true,
    introSeen: data.introSeen === true,
    invalidTapHints: typeof data.invalidTapHints === 'number' ? data.invalidTapHints : 0,
    settings: sanitizeSettings(data.settings),
    devUnlocked: data.devUnlocked === true,
  };
}

export function serialize(save: SaveData): string {
  return JSON.stringify(save);
}

export type LoadOutcome = 'fresh' | 'loaded' | 'recovered-backup' | 'recovered-reset';

/** Ana kayıt bozuksa yedeği, o da bozuksa temiz başlangıcı kullanır; asla hata fırlatmaz. */
export function parseSave(
  main: string | null,
  backup: string | null,
): { save: SaveData; outcome: LoadOutcome } {
  if (main === null && backup === null) return { save: createSave(), outcome: 'fresh' };
  if (main !== null) {
    try {
      return { save: migrate(JSON.parse(main)), outcome: 'loaded' };
    } catch {
      /* yedeğe geç */
    }
  }
  if (backup !== null) {
    try {
      return { save: migrate(JSON.parse(backup)), outcome: 'recovered-backup' };
    } catch {
      /* temiz başlangıç */
    }
  }
  return { save: createSave(), outcome: 'recovered-reset' };
}
