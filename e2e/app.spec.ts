import { expect, test } from '@playwright/test';
import { LEVEL1, LEVEL2, makeSave, playMoves, seed, shot } from './helpers';

test.describe('akış', () => {
  test('ilk açılış: hikâye → öğretici → ilk bölüm çözülür', async ({ page }, info) => {
    await seed(page, null);
    await page.goto('/');
    await expect(page.getByTestId('intro')).toBeVisible();
    await shot(page, '01-intro', info.project.name);
    for (let i = 0; i < 3; i++) await page.getByTestId('intro-next').click();
    await page.getByTestId('intro-next').click();
    await expect(page.getByTestId('game-screen')).toBeVisible();
    await expect(page.getByTestId('coach')).toContainText('dokunun');
    await shot(page, '02-tutorial', info.project.name);
    const [first] = LEVEL1.solution;
    await page.getByTestId(`bottle-${first![0]}`).click();
    await expect(page.getByTestId('coach')).toContainText('parlayan');
    await expect(page.getByTestId(`bottle-${first![1]}`)).toHaveAttribute('data-target', 'true');
    await shot(page, '03-tutorial-target', info.project.name);
    await page.getByTestId(`bottle-${first![1]}`).click();
    await page.waitForTimeout(900);
    await playMoves(page, LEVEL1.solution.slice(1));
    await expect(page.getByTestId('result')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('perfect')).toBeVisible();
    await expect(page.getByTestId('material-reward')).toBeVisible();
    await shot(page, '04-result', info.project.name);
    await page.getByTestId('next-level').click();
    await expect(page.getByTestId('level-title')).toContainText('2');
  });

  test('bölüm çözülür, geri al çalışır ve hamle sayacı geri gider', async ({ page }) => {
    await seed(
      page,
      makeSave({
        levels: { 'oda1-b01': { best: 3, stars: 3, perfect: true, completions: 1 } },
        materials: ['su', 'ates'],
      }),
    );
    await page.goto('/');
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('level-title')).toContainText('Vitrin · 2');
    await playMoves(page, LEVEL2.solution.slice(0, 2));
    await expect(page.getByTestId('moves')).toHaveText('2');
    await page.getByTestId('undo').click();
    await expect(page.getByTestId('moves')).toHaveText('1');
    await playMoves(page, LEVEL2.solution.slice(1));
    await expect(page.getByTestId('result')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('result-moves')).toHaveText(String(LEVEL2.optimalMoves));
  });

  test('ipucu toz harcar ve önerilen hamleyi gösterir', async ({ page }, info) => {
    await seed(
      page,
      makeSave({ levels: { 'oda1-b01': { best: 3, stars: 3, perfect: true, completions: 1 } } }),
    );
    await page.goto('/');
    await page.getByTestId('continue').click();
    await page.getByTestId('hint').click();
    await expect(page.getByTestId('paid-dialog')).toBeVisible();
    await page.getByTestId('paid-yes').click();
    await expect(page.locator('.marker.from')).toBeVisible();
    await expect(page.locator('.marker.to')).toBeVisible();
    await expect(page.getByTestId('dust')).toContainText('80');
    await shot(page, '05-hint', info.project.name);
    // Saklı çözümün ilk hamlesi önerilir.
    const [f] = LEVEL2.solution[0]!;
    await expect(
      page.locator(`[data-testid="bottle-${f}"]`).locator('..').locator('.marker.from'),
    ).toBeVisible();
  });

  test('uygulama yeniden açılınca kaldığı yerden devam eder', async ({ page }) => {
    await seed(
      page,
      makeSave({ levels: { 'oda1-b01': { best: 3, stars: 3, perfect: true, completions: 1 } } }),
    );
    await page.goto('/');
    await page.getByTestId('continue').click();
    await playMoves(page, LEVEL2.solution.slice(0, 3));
    await expect(page.getByTestId('moves')).toHaveText('3');
    await page.reload();
    await expect(page.getByTestId('home')).toBeVisible();
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('moves')).toHaveText('3');
    await playMoves(page, LEVEL2.solution.slice(3));
    await expect(page.getByTestId('result')).toBeVisible({ timeout: 5000 });
  });

  test('yeniden başla onay ister', async ({ page }) => {
    await seed(
      page,
      makeSave({ levels: { 'oda1-b01': { best: 3, stars: 3, perfect: true, completions: 1 } } }),
    );
    await page.goto('/');
    await page.getByTestId('continue').click();
    await playMoves(page, LEVEL2.solution.slice(0, 1));
    await page.getByTestId('restart').click();
    await expect(page.getByTestId('restart-dialog')).toBeVisible();
    await page.getByTestId('restart-yes').click();
    await expect(page.getByTestId('moves')).toHaveText('0');
  });

  test('geri tuşu: oyun → harita/ana ekran, ana ekranda çıkış sorusu', async ({ page }) => {
    await seed(page, makeSave());
    await page.goto('/');
    await page.getByTestId('nav-rooms').click();
    await page.getByTestId('level-1').click();
    await expect(page.getByTestId('game-screen')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('map')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('home')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('exit-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('exit-dialog')).toBeHidden();
  });
});
