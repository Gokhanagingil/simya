import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const isNative = (): boolean => Capacitor.isNativePlatform();

/** Android geri tuşu. Web'de (ve uçtan uca testlerde) Escape tuşu aynı işi görür. */
export function onBackButton(handler: () => void): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handler();
  };
  window.addEventListener('keydown', onKey);
  (window as unknown as { __simyaBack?: () => void }).__simyaBack = handler;
  let remove: (() => void) | null = null;
  if (isNative()) {
    void App.addListener('backButton', () => handler()).then((h) => {
      remove = () => void h.remove();
    });
  }
  return () => {
    window.removeEventListener('keydown', onKey);
    remove?.();
  };
}

export function onAppPause(handler: () => void): () => void {
  const onVis = () => {
    if (document.visibilityState === 'hidden') handler();
  };
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('pagehide', handler);
  let remove: (() => void) | null = null;
  if (isNative()) {
    void App.addListener('pause', handler).then((h) => {
      remove = () => void h.remove();
    });
  }
  return () => {
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('pagehide', handler);
    remove?.();
  };
}

export function exitApp(): void {
  if (isNative()) void App.exitApp();
}

export function vibrate(kind: 'light' | 'success'): void {
  if (!isNative()) {
    try {
      navigator.vibrate?.(kind === 'light' ? 15 : [20, 40, 30]);
    } catch {
      /* yok say */
    }
    return;
  }
  if (kind === 'light') void Haptics.impact({ style: ImpactStyle.Light });
  else void Haptics.notification({ type: NotificationType.Success });
}

/** Android'deki sistem yazı ölçeği (MainActivity'nin sağladığı köprü). */
export function systemFontScale(): number {
  try {
    const bridge = (window as unknown as { SimyaNative?: { getFontScale(): number } }).SimyaNative;
    const v = bridge?.getFontScale();
    return typeof v === 'number' && v > 0 ? v : 1;
  } catch {
    return 1;
  }
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
