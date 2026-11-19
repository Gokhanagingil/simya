import { useState } from 'react';
import { useApp } from '../app/store';
import { sound } from '../audio/sound';
import { Icon } from '../components/Icon';
import { Dialog, TopBar } from '../components/ui';
import { createSave, type Settings, type TextSize } from '../game/save';
import { tr } from '../i18n/tr';

export function SettingsScreen() {
  const app = useApp();
  const s = app.save.settings;
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const set = (patch: Partial<Settings>) =>
    app.update((save) => ({ ...save, settings: { ...save.settings, ...patch } }));

  const Toggle = ({
    label,
    value,
    onChange,
    hint,
    testId,
  }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    hint?: string;
    testId: string;
  }) => (
    <div className="setting-row">
      <div className="setting-text">
        <span className="setting-label">{label}</span>
        {hint && <span className="setting-hint">{hint}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        className={`switch${value ? ' on' : ''}`}
        onClick={() => onChange(!value)}
        data-testid={testId}
      >
        <span className="switch-text">{value ? tr.settings.on : tr.settings.off}</span>
        <span className="knob" />
      </button>
    </div>
  );

  const sizes: TextSize[] = ['normal', 'large', 'xlarge'];
  const volumes: { key: 'low' | 'mid' | 'high'; v: number }[] = [
    { key: 'low', v: 0.3 },
    { key: 'mid', v: 0.6 },
    { key: 'high', v: 0.95 },
  ];

  return (
    <div className="screen settings-screen" data-testid="settings">
      <TopBar title={tr.settings.title} />
      <div className="scroll">
        <section className="card setting-card">
          <h2 className="h2">{tr.settings.textSize}</h2>
          <div className="segmented" role="radiogroup" aria-label={tr.settings.textSize}>
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={s.textSize === size}
                className={`seg${s.textSize === size ? ' active' : ''} seg-${size}`}
                onClick={() => set({ textSize: size })}
                data-testid={`size-${size}`}
              >
                {tr.settings.textSizes[size]}
              </button>
            ))}
          </div>
          <p className="muted">{tr.settings.sample}</p>
        </section>

        <section className="card setting-card">
          <Toggle
            label={tr.settings.symbols}
            hint={tr.settings.symbolsHint}
            value={s.symbols}
            onChange={(v) => set({ symbols: v })}
            testId="toggle-symbols"
          />
          <Toggle
            label={tr.settings.sound}
            value={s.sound}
            onChange={(v) => {
              set({ sound: v });
              if (v) window.setTimeout(() => sound.play('tap'), 50);
            }}
            testId="toggle-sound"
          />
          <div className="setting-row column">
            <span className="setting-label">{tr.settings.volume}</span>
            <div className="segmented" role="radiogroup" aria-label={tr.settings.volume}>
              {volumes.map((vol) => {
                const active = Math.abs(s.volume - vol.v) < 0.15;
                return (
                  <button
                    key={vol.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`seg${active ? ' active' : ''}`}
                    onClick={() => {
                      set({ volume: vol.v });
                      window.setTimeout(() => sound.play('seal'), 50);
                    }}
                  >
                    {tr.settings.volumeLevels[vol.key]}
                  </button>
                );
              })}
            </div>
          </div>
          <Toggle
            label={tr.settings.music}
            value={s.music}
            onChange={(v) => set({ music: v })}
            testId="toggle-music"
          />
          <Toggle
            label={tr.settings.vibration}
            value={s.vibration}
            onChange={(v) => set({ vibration: v })}
            testId="toggle-vibration"
          />
          <Toggle
            label={tr.settings.slowAnimation}
            hint={tr.settings.slowAnimationHint}
            value={s.slowAnimation}
            onChange={(v) => set({ slowAnimation: v })}
            testId="toggle-slow"
          />
        </section>

        <section className="card setting-card actions-col">
          <button
            type="button"
            className="btn block"
            onClick={() => {
              app.update((save) => ({
                ...save,
                tutorialDone: false,
                active: save.active?.levelId === 'oda1-b01' ? null : save.active,
              }));
              app.toast(tr.settings.tutorialDone);
              app.push({ name: 'game', levelId: 'oda1-b01', nonce: Date.now() });
            }}
            data-testid="replay-tutorial"
          >
            <Icon name="info" />
            {tr.settings.tutorial}
          </button>
          <button
            type="button"
            className="btn block"
            onClick={() => app.push({ name: 'about' })}
            data-testid="about"
          >
            <Icon name="book" />
            {tr.settings.about}
          </button>
          <button
            type="button"
            className="btn block danger"
            onClick={() => setResetStep(1)}
            data-testid="reset"
          >
            {tr.settings.reset}
          </button>
        </section>
      </div>

      {resetStep === 1 && (
        <Dialog
          title={tr.settings.resetTitle}
          onDismiss={() => setResetStep(0)}
          actions={[
            {
              label: tr.settings.resetYes,
              kind: 'danger',
              onClick: () => setResetStep(2),
              testId: 'reset-yes',
            },
            { label: tr.common.cancel, onClick: () => setResetStep(0) },
          ]}
        >
          <p>{tr.settings.resetBody}</p>
        </Dialog>
      )}
      {resetStep === 2 && (
        <Dialog
          title={tr.settings.resetConfirmTitle}
          onDismiss={() => setResetStep(0)}
          actions={[
            {
              label: tr.settings.resetConfirmYes,
              kind: 'danger',
              testId: 'reset-confirm',
              onClick: () => {
                setResetStep(0);
                app.update((save) => ({
                  ...createSave(),
                  settings: save.settings,
                  introSeen: true,
                }));
                app.toast(tr.settings.resetDone);
                app.reset({ name: 'home' });
              },
            },
            { label: tr.common.cancel, kind: 'primary', onClick: () => setResetStep(0) },
          ]}
        >
          <p>{tr.settings.resetConfirmBody}</p>
        </Dialog>
      )}
    </div>
  );
}
