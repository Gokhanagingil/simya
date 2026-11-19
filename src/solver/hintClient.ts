import type { GameState } from '../engine';
import { computeHint, type HintResult } from './hint';

let worker: Worker | null = null;
let seq = 0;

/** İpucu çözücüsünü Web Worker'da çalıştırır; Worker yoksa aynı iş parçacığında çalışır. */
export function requestHint(state: GameState, timeLimitMs: number): Promise<HintResult> {
  if (typeof Worker === 'undefined') return Promise.resolve(computeHint(state, timeLimitMs));
  if (!worker)
    worker = new Worker(new URL('./hint.worker.ts', import.meta.url), { type: 'module' });
  const id = ++seq;
  const w = worker;
  return new Promise((resolve) => {
    const onMessage = (e: MessageEvent<{ id: number; result: HintResult }>) => {
      if (e.data.id !== id) return;
      w.removeEventListener('message', onMessage);
      resolve(e.data.result);
    };
    w.addEventListener('message', onMessage);
    w.postMessage({ id, state, timeLimitMs });
  });
}
