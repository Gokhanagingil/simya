import type { Page } from '@playwright/test';
import room1 from '../src/levels/room1.json' with { type: 'json' };

export const LEVEL1 = room1[0]!;
export const LEVEL2 = room1[1]!;

export function makeSave(over: Record<string, unknown> = {}) {
  return {
    version: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    dust: 100,
    levels: {},
    active: null,
    materials: [],
    discoveries: [],
    failStreak: 0,
    story: ['giris'],
    roomsCompleted: [],
    roomsAnnounced: [1],
    seen: [],
    tutorialDone: true,
    introSeen: true,
    invalidTapHints: 3,
    settings: {
      textSize: 'normal',
      symbols: true,
      sound: false,
      music: false,
      volume: 0.6,
      vibration: false,
      slowAnimation: false,
    },
    devUnlocked: false,
    ...over,
  };
}

/** Kaydı yalnızca ilk yüklemede yerleştirir (sonraki yeniden yüklemelerde oyunun kendi kaydı kalır). */
export async function seed(page: Page, save: object | null) {
  await page.addInitScript(
    (s) => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.clear();
      if (s) localStorage.setItem('simya.kayit', s);
    },
    save ? JSON.stringify(save) : null,
  );
}

export async function playMoves(page: Page, moves: readonly (readonly number[])[]) {
  for (const [f, t] of moves) {
    await page.getByTestId(`bottle-${f}`).click();
    await page.getByTestId(`bottle-${t}`).click();
    // Dökme animasyonu bitene kadar dokunuşlar yok sayılır.
    await page.waitForFunction(
      () => !document.querySelector('.stream') && !document.querySelector('.unit-fill'),
      null,
      { timeout: 5000 },
    );
    await page.waitForTimeout(120);
  }
}

export async function shot(page: Page, name: string, project: string) {
  await page.waitForTimeout(300);
  await page.screenshot({ path: `e2e/screens/${project}/${name}.png` });
}
