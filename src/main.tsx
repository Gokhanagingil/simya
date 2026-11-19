import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SplashScreen } from '@capacitor/splash-screen';
import './styles/global.css';
import './styles/screens.css';
import { App } from './app/App';
import { AppProvider, loadSave } from './app/store';
import { tr } from './i18n/tr';
import { isNative, systemFontScale } from './platform/native';
import type { SaveData } from './game/save';

async function boot() {
  const { save, outcome } = await loadSave();
  let initial: SaveData = save;
  // İlk açılış: sistem yazı ölçeği büyükse oyunun yazı boyutu da büyük başlar.
  if (outcome === 'fresh') {
    const scale = systemFontScale();
    if (scale >= 1.3) initial = { ...save, settings: { ...save.settings, textSize: 'xlarge' } };
    else if (scale >= 1.12)
      initial = { ...save, settings: { ...save.settings, textSize: 'large' } };
  }
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <StrictMode>
      <AppProvider initial={initial}>
        <App />
      </AppProvider>
    </StrictMode>,
  );
  if (outcome === 'recovered-backup' || outcome === 'recovered-reset') {
    window.setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'toast-wrap';
      el.innerHTML = `<div class="toast" role="status"></div>`;
      el.firstElementChild!.textContent =
        outcome === 'recovered-backup' ? tr.saveRecovered : tr.saveReset;
      document.body.appendChild(el);
      window.setTimeout(() => el.remove(), 4000);
    }, 600);
  }
  if (isNative()) void SplashScreen.hide();
}

void boot();
