/// <reference lib="webworker" />
import type { GameState } from '../engine';
import { computeHint } from './hint';

self.onmessage = (e: MessageEvent<{ id: number; state: GameState; timeLimitMs: number }>) => {
  const { id, state, timeLimitMs } = e.data;
  const result = computeHint(state, timeLimitMs);
  (self as unknown as Worker).postMessage({ id, result });
};
