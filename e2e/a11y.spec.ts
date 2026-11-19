import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { makeSave, seed, shot } from './helpers';

const richSave = () => {
  const levels: Record<string, object> = {};
  for (let i = 1; i <= 8; i++)
    levels[`oda1-b${String(i).padStart(2, '0')}`] = {
      best: 12,
      stars: (i % 3) + 1,
      perfect: i % 4 === 0,
      completions: 1,
    };
  return makeSave({
    dust: 245,
    levels,
    materials: ['su', 'ates', 'toprak', 'buhar', 'camur'],
    discoveries: ['buhar', 'camur'],
  });
};

const SCREENS: { name: string; go: (p: Page) => Promise<void> }[] = [
  { name: 'home', go: async () => {} },
  { name: 'map', go: async (p) => p.getByTestId('nav-rooms').click() },
  { name: 'game', go: async (p) => p.getByTestId('continue').click() },
  { name: 'table', go: async (p) => p.getByTestId('nav-table').click() },
  {
    name: 'pyramid',
    go: async (p) => {
      await p.getByTestId('nav-table').click();
      await p.getByTestId('to-pyramid').click();
    },
  },
  { name: 'notebook', go: async (p) => p.getByTestId('nav-notebook').click() },
  {
    name: 'howto',
    go: async (p) => {
      await p.getByTestId('nav-notebook').click();
      await p.getByTestId('tab-howto').click();
    },
  },
  { name: 'settings', go: async (p) => p.getByTestId('nav-settings').click() },
];

async function checkNoOverflow(page: Page) {
  const problems = await page.evaluate(() => {
    const out: string[] = [];
    if (document.documentElement.scrollWidth > window.innerWidth + 1)
      out.push('sayfa yatay taşıyor');
    for (const el of Array.from(
      document.querySelectorAll<HTMLElement>('button, h1, h2, p, span, li'),
    )) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > window.innerWidth + 1 || r.left < -1)
        out.push(`ekran dışında: ${el.tagName} "${el.textContent?.slice(0, 30)}"`);
      if (el.tagName === 'BUTTON' && el.scrollWidth > el.clientWidth + 2)
        out.push(`düğme metni taşıyor: "${el.textContent?.slice(0, 30)}"`);
    }
    return out;
  });
  expect(problems).toEqual([]);
}

async function checkTapTargets(page: Page) {
  const small = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('button'))
      .filter((b) => !b.closest('[aria-hidden="true"]'))
      .map((b) => ({
        t: b.textContent?.trim().slice(0, 24) || b.getAttribute('aria-label') || b.dataset.testid,
        r: b.getBoundingClientRect(),
      }))
      .filter(({ r }) => r.width > 0 && r.height > 0 && (r.width < 55.5 || r.height < 55.5))
      .map(({ t, r }) => `${t} ${Math.round(r.width)}×${Math.round(r.height)}`),
  );
  expect(small).toEqual([]);
}

for (const size of ['normal', 'xlarge'] as const) {
  test.describe(`yazı boyutu: ${size}`, () => {
    for (const s of SCREENS) {
      test(`${s.name}: taşma yok, dokunma alanı ≥ 56 dp, kontrast denetimi`, async ({
        page,
      }, info) => {
        const save = richSave();
        (save.settings as { textSize: string }).textSize = size;
        await seed(page, save);
        await page.goto('/');
        await expect(page.getByTestId('home')).toBeVisible();
        await s.go(page);
        await page.waitForTimeout(500);
        await shot(page, `${size}-${s.name}`, info.project.name);
        await checkNoOverflow(page);
        await checkTapTargets(page);
        const axe = await new AxeBuilder({ page: page as never })
          .withRules([
            'color-contrast',
            'color-contrast-enhanced',
            'button-name',
            'image-alt',
            'aria-allowed-attr',
            'aria-required-attr',
            'aria-valid-attr-value',
          ])
          .analyze();
        const violations = axe.violations.map(
          (v) =>
            `${v.id}: ${v.nodes
              .map((n) => n.target.join(' '))
              .slice(0, 4)
              .join(' | ')}`,
        );
        expect(violations).toEqual([]);
      });
    }
  });
}
