/**
 * Uygulama simgesi ve açılış ekranı PNG'lerini assets/*.svg'den üretir (geliştirme sırasında bir kez).
 * Kullanım: node scripts/make-icons.cjs   (Playwright'ın Chromium'u ile çizer)
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const res = path.join(root, 'android/app/src/main/res');
const fg = fs.readFileSync(path.join(root, 'assets/icon-foreground.svg'), 'utf8');
const bg = fs.readFileSync(path.join(root, 'assets/icon-background.svg'), 'utf8');
const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

async function render(page, html, w, h, file, transparent = false) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${html}</body></html>`,
  );
  await page.screenshot({
    path: file,
    omitBackground: transparent,
    clip: { x: 0, y: 0, width: w, height: h },
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const svg = (s, size) =>
    s.replace('width="108" height="108"', `width="${size}" height="${size}"`);
  for (const [d, k] of Object.entries(dens)) {
    const fgSize = Math.round(108 * k);
    await render(
      page,
      svg(fg, fgSize),
      fgSize,
      fgSize,
      path.join(res, `mipmap-${d}/ic_launcher_foreground.png`),
      true,
    );
    const legacy = Math.round(48 * k);
    // Eski Android sürümleri için tam simge: arka plan + ön katman, yuvarlatılmış kare ve daire.
    const layer = (
      r,
    ) => `<div style="width:${legacy}px;height:${legacy}px;border-radius:${r};overflow:hidden;position:relative">
      <div style="position:absolute;left:${-legacy * 0.25}px;top:${-legacy * 0.25}px">${svg(bg, legacy * 1.5)}</div>
      <div style="position:absolute;left:${-legacy * 0.25}px;top:${-legacy * 0.25}px">${svg(fg, legacy * 1.5)}</div></div>`;
    await render(
      page,
      layer('22%'),
      legacy,
      legacy,
      path.join(res, `mipmap-${d}/ic_launcher.png`),
      true,
    );
    await render(
      page,
      layer('50%'),
      legacy,
      legacy,
      path.join(res, `mipmap-${d}/ic_launcher_round.png`),
      true,
    );
  }
  // Açılış ekranı: parşömen zemin, ortada simge ve ad.
  const splash = (w, h) => {
    const s = Math.round(Math.min(w, h) * 0.42);
    return `<div style="width:${w}px;height:${h}px;background:radial-gradient(circle at 50% 40%,#fbf3df,#ecdfc0);display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div style="width:${s}px;height:${s}px;border-radius:24%;overflow:hidden;position:relative;box-shadow:0 ${s * 0.04}px ${s * 0.12}px rgba(61,36,20,.35)">
        <div style="position:absolute;left:${-s * 0.25}px;top:${-s * 0.25}px">${svg(bg, s * 1.5)}</div>
        <div style="position:absolute;left:${-s * 0.25}px;top:${-s * 0.25}px">${svg(fg, s * 1.5)}</div></div></div>`;
  };
  const sizes = {
    drawable: [480, 320],
    'drawable-port-mdpi': [320, 480],
    'drawable-port-hdpi': [480, 800],
    'drawable-port-xhdpi': [720, 1280],
    'drawable-port-xxhdpi': [960, 1600],
    'drawable-port-xxxhdpi': [1280, 1920],
    'drawable-land-mdpi': [480, 320],
    'drawable-land-hdpi': [800, 480],
    'drawable-land-xhdpi': [1280, 720],
    'drawable-land-xxhdpi': [1600, 960],
    'drawable-land-xxxhdpi': [1920, 1280],
  };
  for (const [dir, [w, h]] of Object.entries(sizes))
    await render(page, splash(w, h), w, h, path.join(res, `${dir}/splash.png`));
  // Web için de simge.
  await render(
    page,
    svg(fg, 192).replace('<defs>', `<rect width="108" height="108" rx="24" fill="#3d2414"/><defs>`),
    192,
    192,
    path.join(root, 'public/icon.png'),
    true,
  );
  await browser.close();
  console.log('Simgeler üretildi.');
})();
