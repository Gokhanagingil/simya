/**
 * Uygulama deposu: kayıt verisi, gezinme yığını, bildirimler. Her değişiklik anında kalıcı
 * depolamaya yazılır (hamle başına kayıt).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createSave, parseSave, serialize, type LoadOutcome, type SaveData } from '../game/save';
import { getStore, SerialWriter } from '../platform/storage';
import { onAppPause, prefersReducedMotion } from '../platform/native';
import { SLOW_ANIMATION_FACTOR } from '../config/game';

export const SAVE_KEY = 'simya.kayit';
export const BACKUP_KEY = 'simya.kayit.yedek';

export type Screen =
  | { name: 'intro' }
  | { name: 'home' }
  | { name: 'map'; room: number }
  | { name: 'game'; levelId: string; nonce?: number }
  | { name: 'table'; focus?: string }
  | { name: 'pyramid' }
  | { name: 'notebook'; tab: 'story' | 'recipes' | 'riddles' | 'howto'; page?: string }
  | { name: 'settings' }
  | { name: 'about' }
  | { name: 'dev' }
  | { name: 'unlock'; room: number };

export interface AppApi {
  save: SaveData;
  update: (fn: (s: SaveData) => SaveData) => void;
  screen: Screen;
  stack: readonly Screen[];
  push: (s: Screen) => void;
  replace: (s: Screen) => void;
  /** Yığının dibine kadar dön ve yeni ekranı aç. */
  reset: (s: Screen) => void;
  pop: () => void;
  toast: (msg: string) => void;
  /** Animasyon süre çarpanı (yavaş animasyon ×1,5). */
  animScale: number;
  reducedMotion: boolean;
  /** Ekranların geri tuşunu kendileri işlemesi için: true dönerse işlenmiş sayılır. */
  setBackHandler: (h: (() => boolean) | null) => void;
  backHandler: React.RefObject<(() => boolean) | null>;
}

const Ctx = createContext<AppApi | null>(null);

export function useApp(): AppApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp, AppProvider dışında');
  return v;
}

export async function loadSave(): Promise<{ save: SaveData; outcome: LoadOutcome }> {
  const store = getStore();
  const [main, backup] = await Promise.all([store.get(SAVE_KEY), store.get(BACKUP_KEY)]);
  const result = parseSave(main, backup);
  // Okunabilen kayıt, bilinen iyi yedek olarak saklanır.
  if (result.outcome === 'loaded' && main) await store.set(BACKUP_KEY, main);
  return result;
}

export function AppProvider({ initial, children }: { initial: SaveData; children: ReactNode }) {
  const [save, setSave] = useState<SaveData>(initial);
  const [stack, setStack] = useState<Screen[]>(() => [
    initial.introSeen ? { name: 'home' } : { name: 'intro' },
  ]);
  const [toastMsg, setToastMsg] = useState<{ text: string; id: number } | null>(null);
  const writer = useMemo(() => new SerialWriter(getStore(), SAVE_KEY), []);
  const backupWriter = useMemo(() => new SerialWriter(getStore(), BACKUP_KEY), []);
  const saveRef = useRef(save);
  const writes = useRef(0);
  const backHandler = useRef<(() => boolean) | null>(null);
  const [reducedMotion] = useState(prefersReducedMotion);

  const update = useCallback(
    (fn: (s: SaveData) => SaveData) => {
      const next = { ...fn(saveRef.current), updatedAt: new Date().toISOString() };
      saveRef.current = next;
      setSave(next);
      const text = serialize(next);
      void writer.write(text);
      // Her 15 yazmada bir yedeği tazele.
      if (++writes.current % 15 === 0) void backupWriter.write(text);
    },
    [writer, backupWriter],
  );

  useEffect(() => onAppPause(() => void writer.flush()), [writer]);

  const animScale = save.settings.slowAnimation ? SLOW_ANIMATION_FACTOR : 1;
  useEffect(() => {
    const scale =
      save.settings.textSize === 'xlarge' ? 1.4 : save.settings.textSize === 'large' ? 1.2 : 1;
    document.documentElement.style.setProperty('--text-scale', String(scale));
    document.documentElement.style.setProperty(
      '--anim-scale',
      String(reducedMotion ? 0.01 : animScale),
    );
    document.documentElement.dataset.textSize = save.settings.textSize;
  }, [save.settings.textSize, animScale, reducedMotion]);

  const toastTimer = useRef<number>(0);
  const toast = useCallback((text: string) => {
    window.clearTimeout(toastTimer.current);
    setToastMsg({ text, id: Date.now() });
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const api: AppApi = {
    save,
    update,
    screen: stack[stack.length - 1]!,
    stack,
    push: (s) => setStack((st) => [...st, s]),
    replace: (s) => setStack((st) => [...st.slice(0, -1), s]),
    reset: (s) =>
      setStack((st) =>
        s.name === 'home' ? [s] : [st[0]!.name === 'home' ? st[0]! : { name: 'home' }, s],
      ),
    pop: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    toast,
    animScale,
    reducedMotion,
    setBackHandler: (h) => {
      backHandler.current = h;
    },
    backHandler,
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      {toastMsg && (
        <div className="toast-wrap" aria-live="polite">
          <div className="toast" key={toastMsg.id} role="status">
            {toastMsg.text}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export { createSave };
