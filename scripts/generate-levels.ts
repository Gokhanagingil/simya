/**
 * Bölüm üretici (derleme zamanında çalışır): npm run levels [oda...]
 *
 * Her bölüm yuvası için tohumlu adaylar üretilir; her aday aynı oyun motorunu kullanan
 * A* çözücüyle KANITLANMIŞ en kısa çözüme sahip olmalıdır (kanıtlanamayan aday atılır).
 * Adaylar zorluk puanına göre sıralanır ve yuvanın rolüne (kolay/orta/zor) göre seçilir.
 * Çıktı: src/levels/room<N>.json
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  COLORS,
  createState,
  isComplete,
  mixIngredients,
  mulberry32,
  randInt,
  shuffle,
  type Color,
  type MechanicId,
} from '../src/engine';
import { solve } from '../src/solver/solver';
import { measureFeatures, scoreDifficulty } from '../src/levels/difficulty';
import { LEVEL_SCHEMA_VERSION, levelId, type LevelDef } from '../src/levels/schema';
import { ROOM_REWARDS } from '../src/levels/rewards';

const CAPACITY = 4;
const MAX_BOTTLES = 10;
const MAX_COLORS = 8;

type Role = 'intro' | 'easy' | 'mid' | 'hard' | 'peak';

interface SlotSpec {
  role: Role;
  /** Klasik/sis: renk sayısı. Karışım: hedefteki dolu şişe sayısı. */
  colors: number;
  empties: number;
  /** Sis: alt birimlerin gizli olma olasılığı. */
  fog?: number;
  /** Karışım: kaç hedef rengin ana renklerden karıştırılması gerekir. */
  mixed?: number;
  minMoves?: number;
  maxMoves?: number;
}

interface RoomSpec {
  room: number;
  mechanics: MechanicId[];
  slots: SlotSpec[];
}

const s = (
  role: Role,
  colors: number,
  empties: number,
  extra: Partial<SlotSpec> = {},
): SlotSpec => ({
  role,
  colors,
  empties,
  ...extra,
});

export const ROOMS: RoomSpec[] = [
  {
    room: 1,
    mechanics: ['classic'],
    slots: [
      s('intro', 2, 1, { minMoves: 3, maxMoves: 5 }),
      s('easy', 3, 2, { minMoves: 5 }),
      s('mid', 3, 2, { minMoves: 6 }),
      s('mid', 4, 2),
      s('easy', 4, 2),
      s('mid', 5, 2),
      s('hard', 5, 2),
      s('hard', 4, 1),
      s('easy', 5, 2),
      s('mid', 6, 2),
      s('hard', 6, 2),
      s('hard', 5, 1),
      s('easy', 6, 2),
      s('mid', 7, 2),
      s('hard', 7, 2),
      s('hard', 6, 1),
      s('easy', 7, 2),
      s('hard', 8, 2),
      s('hard', 7, 1),
      s('peak', 8, 2),
    ],
  },
  {
    room: 2,
    mechanics: ['classic', 'fog'],
    slots: [
      s('intro', 2, 2, { fog: 0.6, minMoves: 3, maxMoves: 6 }),
      s('easy', 3, 3, { fog: 0.35 }),
      s('mid', 4, 3, { fog: 0.35 }),
      s('mid', 4, 2, { fog: 0.3 }),
      s('easy', 4, 3, { fog: 0.45 }),
      s('mid', 5, 3, { fog: 0.4 }),
      s('hard', 5, 3, { fog: 0.55 }),
      s('hard', 5, 2, { fog: 0.4 }),
      s('easy', 5, 3, { fog: 0.4 }),
      s('mid', 6, 3, { fog: 0.45 }),
      s('hard', 6, 3, { fog: 0.6 }),
      s('hard', 6, 2, { fog: 0.45 }),
      s('easy', 6, 3, { fog: 0.45 }),
      s('mid', 7, 3, { fog: 0.5 }),
      s('hard', 6, 2, { fog: 0.6 }),
      s('hard', 7, 3, { fog: 0.65 }),
      s('easy', 6, 3, { fog: 0.5 }),
      s('hard', 7, 3, { fog: 0.7 }),
      s('hard', 7, 2, { fog: 0.6 }),
      s('peak', 8, 2, { fog: 0.65 }),
    ],
  },
  {
    room: 3,
    mechanics: ['classic', 'mix'],
    slots: [
      s('intro', 2, 1, { mixed: 1, minMoves: 2, maxMoves: 5 }),
      s('easy', 3, 2, { mixed: 1 }),
      s('mid', 3, 2, { mixed: 1 }),
      s('mid', 4, 2, { mixed: 2 }),
      s('easy', 4, 2, { mixed: 1 }),
      s('mid', 4, 2, { mixed: 2 }),
      s('hard', 5, 2, { mixed: 2 }),
      s('hard', 4, 1, { mixed: 2 }),
      s('easy', 5, 2, { mixed: 1 }),
      s('mid', 5, 2, { mixed: 2 }),
      s('hard', 6, 2, { mixed: 2 }),
      s('hard', 5, 2, { mixed: 3 }),
      s('easy', 5, 2, { mixed: 2 }),
      s('mid', 6, 2, { mixed: 3 }),
      s('hard', 6, 2, { mixed: 2 }),
      s('hard', 6, 1, { mixed: 3 }),
      s('easy', 6, 2, { mixed: 2 }),
      s('hard', 6, 2, { mixed: 3 }),
      s('hard', 6, 1, { mixed: 3 }),
      s('peak', 6, 1, { mixed: 3 }),
    ],
  },
];

/** Yuva rolüne göre aday havuzunda seçilecek yüzdelik. */
const ROLE_PERCENTILE: Record<Role, number> = {
  intro: 0,
  easy: 0.2,
  mid: 0.55,
  hard: 0.85,
  peak: 1,
};

interface Candidate {
  seed: number;
  bottles: Color[][];
  hidden: boolean[][];
}

function classicCandidate(spec: SlotSpec, seed: number, fog: boolean): Candidate {
  const rand = mulberry32(seed);
  const palette = shuffle(COLORS.slice(), rand).slice(0, spec.colors);
  const units: Color[] = palette.flatMap((c) => Array<Color>(CAPACITY).fill(c));
  const mixed = shuffle(units, rand);
  const bottles: Color[][] = [];
  for (let b = 0; b < spec.colors; b++) bottles.push(mixed.slice(b * CAPACITY, (b + 1) * CAPACITY));
  for (let e = 0; e < spec.empties; e++) bottles.push([]);
  const p = fog ? (spec.fog ?? 0.4) : 0;
  const hidden = bottles.map((b) => b.map((_, i) => i < b.length - 1 && rand() < p));
  if (fog && hidden.flat().every((h) => !h)) hidden[0]![0] = true;
  return { seed, bottles, hidden };
}

const SECONDARY: Color[] = ['orange', 'green', 'purple'];
const PURE_POOL: Color[] = [
  'pink',
  'brown',
  'gray',
  'red',
  'yellow',
  'blue',
  'orange',
  'green',
  'purple',
];

function mixCandidate(spec: SlotSpec, seed: number): Candidate {
  const rand = mulberry32(seed);
  const mixedFinals = shuffle(SECONDARY, rand).slice(0, spec.mixed ?? 1);
  const pureCount = spec.colors - mixedFinals.length;
  const pures = shuffle(
    PURE_POOL.filter((c) => !mixedFinals.includes(c)),
    rand,
  ).slice(0, pureCount);
  const units: Color[] = [];
  for (const final of mixedFinals) {
    const [a, b] = mixIngredients(final)!;
    const premade = rand() < 0.35 ? randInt(rand, 1, 2) : 0;
    const rest = CAPACITY - premade;
    const na = randInt(rand, 1, rest - 1);
    for (let i = 0; i < premade; i++) units.push(final);
    for (let i = 0; i < na; i++) units.push(a);
    for (let i = 0; i < rest - na; i++) units.push(b);
  }
  for (const c of pures) for (let i = 0; i < CAPACITY; i++) units.push(c);
  const mixed = shuffle(units, rand);
  const bottles: Color[][] = [];
  for (let b = 0; b < spec.colors; b++) bottles.push(mixed.slice(b * CAPACITY, (b + 1) * CAPACITY));
  for (let e = 0; e < spec.empties; e++) bottles.push([]);
  return { seed, bottles, hidden: bottles.map((b) => b.map(() => false)) };
}

interface Evaluated extends Candidate {
  optimal: number;
  solution: [number, number][];
  difficulty: number;
}

function evaluate(room: RoomSpec, spec: SlotSpec, cand: Candidate): Evaluated | null {
  if (cand.bottles.length > MAX_BOTTLES) return null;
  const distinct = new Set(cand.bottles.flat()).size;
  if (distinct > MAX_COLORS) return null;
  // Başlangıçta tamamlanmış şişe olmasın.
  if (cand.bottles.some((b) => b.length === CAPACITY && b.every((c) => c === b[0]))) return null;
  const state = createState(cand.bottles, {
    capacity: CAPACITY,
    mechanics: room.mechanics,
    hidden: cand.hidden,
  });
  if (state.bottles.some((b) => isComplete(b, CAPACITY))) return null;
  const result = solve(state, { maxNodes: room.mechanics.includes('mix') ? 250_000 : 1_500_000 });
  if (result.status !== 'solved' || !result.optimal) return null;
  const optimal = result.moves.length;
  if (spec.minMoves !== undefined && optimal < spec.minMoves) return null;
  if (spec.maxMoves !== undefined && optimal > spec.maxMoves) return null;
  const features = measureFeatures(state, result.moves, cand.seed);
  return {
    ...cand,
    optimal,
    solution: result.moves.map(([f, t]) => [f, t]),
    difficulty: scoreDifficulty(features),
  };
}

function generateSlot(room: RoomSpec, index: number, poolSize: number): LevelDef {
  const spec = room.slots[index - 1]!;
  const pool: Evaluated[] = [];
  let attempt = 0;
  const isMix = room.mechanics.includes('mix');
  const want =
    spec.role === 'intro'
      ? Math.max(6, poolSize / 2)
      : spec.role === 'peak'
        ? poolSize * (isMix ? 1.5 : 3)
        : poolSize;
  const seen = new Set<string>();
  while (pool.length < want && attempt < want * 40) {
    attempt++;
    const seed = room.room * 1_000_000 + index * 10_000 + attempt;
    const cand = room.mechanics.includes('mix')
      ? mixCandidate(spec, seed)
      : classicCandidate(spec, seed, room.mechanics.includes('fog'));
    const key = JSON.stringify(cand.bottles);
    if (seen.has(key)) continue;
    seen.add(key);
    const ev = evaluate(room, spec, cand);
    if (ev) pool.push(ev);
  }
  if (pool.length === 0) throw new Error(`${levelId(room.room, index)}: aday bulunamadı`);
  pool.sort((a, b) => a.difficulty - b.difficulty || a.seed - b.seed);
  const pick = pool[Math.round(ROLE_PERCENTILE[spec.role] * (pool.length - 1))]!;
  console.error(
    `${levelId(room.room, index)}  ${spec.role.padEnd(5)}  şişe ${pick.bottles.length}  en iyi ${String(pick.optimal).padStart(2)}  zorluk ${pick.difficulty.toFixed(3)}  (havuz ${pool.length}, deneme ${attempt})`,
  );
  return {
    schemaVersion: LEVEL_SCHEMA_VERSION,
    id: levelId(room.room, index),
    room: room.room,
    index,
    seed: pick.seed,
    capacity: CAPACITY,
    mechanics: room.mechanics,
    bottles: pick.bottles,
    hidden: pick.hidden,
    optimalMoves: pick.optimal,
    solution: pick.solution,
    difficulty: pick.difficulty,
    reward: ROOM_REWARDS[room.room]?.[index] ?? {},
  };
}

const POOL_SIZE = 24;

function runWorker(roomId: number, index: number): void {
  const room = ROOMS.find((r) => r.room === roomId)!;
  process.stdout.write(JSON.stringify(generateSlot(room, index, POOL_SIZE)));
}

/** Yuva önbelleği: aynı yuva tanımı ve üretici sürümü için sonuç yeniden hesaplanmaz. */
const GENERATOR_VERSION = 3;
function cacheFile(here: string, roomId: number, index: number): { file: string; key: string } {
  const room = ROOMS.find((r) => r.room === roomId)!;
  const key = JSON.stringify({
    v: GENERATOR_VERSION,
    mech: room.mechanics,
    spec: room.slots[index - 1],
    pool: POOL_SIZE,
    rewards: ROOM_REWARDS[roomId]?.[index] ?? {},
  });
  return { file: join(here, '.cache', `${levelId(roomId, index)}.json`), key };
}

function spawnSlot(here: string, roomId: number, index: number): Promise<LevelDef> {
  const { file, key } = cacheFile(here, roomId, index);
  if (existsSync(file)) {
    const cached = JSON.parse(readFileSync(file, 'utf8')) as { key: string; level: LevelDef };
    if (cached.key === key) {
      console.error(`${levelId(roomId, index)}  (önbellekten)`);
      return Promise.resolve(cached.level);
    }
  }
  return spawnFresh(here, roomId, index).then((level) => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify({ key, level }));
    return level;
  });
}

function spawnFresh(here: string, roomId: number, index: number): Promise<LevelDef> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        ...process.execArgv,
        join(here, 'generate-levels.ts'),
        '--slot',
        String(roomId),
        String(index),
      ],
      {
        stdio: ['ignore', 'pipe', 'inherit'],
      },
    );
    let out = '';
    child.stdout.on('data', (d: Buffer) => (out += d.toString()));
    child.on('exit', (code) =>
      code === 0
        ? resolve(JSON.parse(out) as LevelDef)
        : reject(new Error(`${roomId}/${index} çıkış ${code}`)),
    );
  });
}

async function main(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const argv = process.argv.slice(2);
  if (argv[0] === '--slot') {
    runWorker(Number(argv[1]), Number(argv[2]));
    return;
  }
  const args = argv.map(Number).filter(Boolean);
  const rooms = args.length ? ROOMS.filter((r) => args.includes(r.room)) : ROOMS;
  const jobs = rooms.flatMap((r) => r.slots.map((_, i) => ({ room: r.room, index: i + 1 })));
  const results = new Map<string, LevelDef>();
  const t = Date.now();
  let next = 0;
  const workers = Array.from({ length: Math.max(1, cpus().length) }, async () => {
    while (next < jobs.length) {
      const job = jobs[next++]!;
      results.set(levelId(job.room, job.index), await spawnSlot(here, job.room, job.index));
    }
  });
  await Promise.all(workers);
  for (const room of rooms) {
    const levels = room.slots.map((_, i) => results.get(levelId(room.room, i + 1))!);
    const keys = new Set(levels.map((l) => JSON.stringify(l.bottles)));
    if (keys.size !== levels.length)
      throw new Error(`Oda ${room.room}: aynı bölüm iki kez üretildi`);
    const out = join(here, '..', 'src', 'levels', `room${room.room}.json`);
    writeFileSync(out, JSON.stringify(levels, null, 1) + '\n');
    console.log(`✓ Oda ${room.room}: ${levels.length} bölüm → ${out}`);
  }
  console.log(`Toplam ${((Date.now() - t) / 1000).toFixed(1)} sn`);
}

void main();
