/**
 * Kalıcı depolama: Android'de @capacitor/preferences (SharedPreferences → Otomatik Yedekleme ile
 * taşınır), web'de localStorage. Yazmalar sıraya alınır; son değer her zaman yazılır.
 */
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

const webStore: KeyValueStore = {
  async get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* depolama kapalıysa sessizce geç */
    }
  },
  async remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* yok say */
    }
  },
};

const nativeStore: KeyValueStore = {
  async get(key) {
    const { value } = await Preferences.get({ key });
    return value;
  },
  async set(key, value) {
    await Preferences.set({ key, value });
  },
  async remove(key) {
    await Preferences.remove({ key });
  },
};

export function getStore(): KeyValueStore {
  return Capacitor.isNativePlatform() ? nativeStore : webStore;
}

/** Aynı anahtara art arda gelen yazmaları sıraya koyar; aradaki ara değerler atlanabilir. */
export class SerialWriter {
  private pending: string | null = null;
  private running: Promise<void> | null = null;

  constructor(
    private readonly store: KeyValueStore,
    private readonly key: string,
  ) {}

  write(value: string): Promise<void> {
    this.pending = value;
    if (!this.running) this.running = this.drain();
    return this.running;
  }

  private async drain(): Promise<void> {
    while (this.pending !== null) {
      const value = this.pending;
      this.pending = null;
      try {
        await this.store.set(this.key, value);
      } catch (err) {
        console.error('Kayıt yazılamadı', err);
      }
    }
    this.running = null;
  }

  flush(): Promise<void> {
    return this.running ?? Promise.resolve();
  }
}
