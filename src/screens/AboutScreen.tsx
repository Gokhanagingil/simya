import { useRef, useState } from 'react';
import { useApp } from '../app/store';
import { TopBar } from '../components/ui';
import { tr } from '../i18n/tr';

const TAPS_TO_UNLOCK = 7;

export function AboutScreen() {
  const app = useApp();
  const [taps, setTaps] = useState(0);
  const last = useRef(0);
  const onVersionTap = () => {
    const now = Date.now();
    const n = now - last.current > 1500 ? 1 : taps + 1;
    last.current = now;
    setTaps(n);
    if (n >= TAPS_TO_UNLOCK) {
      setTaps(0);
      app.update((s) => ({ ...s, devUnlocked: true }));
      app.push({ name: 'dev' });
    } else if (n >= 4) app.toast(tr.about.devLeft(TAPS_TO_UNLOCK - n));
  };
  return (
    <div className="screen about-screen" data-testid="about-screen">
      <TopBar title={tr.about.title} />
      <div className="scroll">
        <div className="card">
          <h2 className="h2">{tr.appName}</h2>
          {/* Sürüm satırı: 7 kez dokunulunca gizli geliştirici menüsü açılır. */}
          <p className="version" onClick={onVersionTap} data-testid="version">
            {tr.about.version(__APP_VERSION__)}
          </p>
          <p>{tr.about.body}</p>
          <p className="small muted">{tr.about.licenses}</p>
        </div>
      </div>
    </div>
  );
}
